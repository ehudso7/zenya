# CloudFlare Configuration for CDN and Security

data "cloudflare_zone" "zenya" {
  name = "zenyaai.com"
}

# DNS Records
resource "cloudflare_record" "zenya_apex" {
  zone_id = data.cloudflare_zone.zenya.id
  name    = "@"
  value   = "76.76.21.21" # Vercel's IP
  type    = "A"
  proxied = true
}

resource "cloudflare_record" "zenya_www" {
  zone_id = data.cloudflare_zone.zenya.id
  name    = "www"
  value   = "zenyaai.com"
  type    = "CNAME"
  proxied = true
}

# SSL/TLS Configuration
resource "cloudflare_zone_settings_override" "zenya_ssl" {
  zone_id = data.cloudflare_zone.zenya.id
  
  settings {
    ssl                      = "strict"
    always_use_https         = "on"
    min_tls_version         = "1.2"
    automatic_https_rewrites = "on"
    tls_1_3                 = "on"
    
    # Security Headers
    security_header {
      enabled = true
      
      include_subdomains = true
      max_age           = 31536000
      nosniff           = true
      preload           = true
    }
  }
}

# Page Rules
resource "cloudflare_page_rule" "force_https" {
  zone_id  = data.cloudflare_zone.zenya.id
  target   = "http://*zenyaai.com/*"
  priority = 1
  
  actions {
    always_use_https = true
  }
}

resource "cloudflare_page_rule" "api_cache_bypass" {
  zone_id  = data.cloudflare_zone.zenya.id
  target   = "*zenyaai.com/api/*"
  priority = 2
  
  actions {
    cache_level = "bypass"
  }
}

resource "cloudflare_page_rule" "static_assets_cache" {
  zone_id  = data.cloudflare_zone.zenya.id
  target   = "*zenyaai.com/_next/static/*"
  priority = 3
  
  actions {
    cache_level            = "cache_everything"
    edge_cache_ttl        = 2419200 # 28 days
    browser_cache_ttl     = 86400   # 1 day
    cache_on_cookie       = ""
    cache_deception_armor = "on"
  }
}

# WAF Rules
resource "cloudflare_ruleset" "zenya_waf" {
  zone_id     = data.cloudflare_zone.zenya.id
  name        = "Zenya WAF Rules"
  description = "Custom WAF rules for Zenya"
  kind        = "zone"
  phase       = "http_request_firewall_custom"
  
  # Block requests from specific countries (if needed)
  rules {
    action = "block"
    action_parameters {
      response {
        status_code = 403
        content     = "Access Denied"
        content_type = "text/plain"
      }
    }
    expression  = "(ip.geoip.country in {\"CN\" \"RU\" \"KP\"})"
    description = "Block high-risk countries"
    enabled     = false # Disabled by default, enable if needed
  }
  
  # Rate limiting rule
  rules {
    action = "challenge"
    ratelimit {
      characteristics = ["ip.src"]
      period          = 60
      requests_per_period = 100
      mitigation_timeout = 600
    }
    expression  = "(http.request.uri.path contains \"/api/\")"
    description = "Rate limit API endpoints"
    enabled     = true
  }
  
  # Block SQL injection attempts
  rules {
    action      = "block"
    expression  = "(http.request.uri.query contains \"union select\" or http.request.uri.query contains \"drop table\")"
    description = "Block SQL injection attempts"
    enabled     = true
  }
}

# DDoS Protection
resource "cloudflare_zone_settings_override" "zenya_ddos" {
  zone_id = data.cloudflare_zone.zenya.id
  
  settings {
    security_level = "medium"
    challenge_ttl  = 1800
    
    # Browser Integrity Check
    browser_check = "on"
    
    # Hotlink Protection
    hotlink_protection = "on"
  }
}

# Cache Rules
resource "cloudflare_ruleset" "zenya_cache" {
  zone_id     = data.cloudflare_zone.zenya.id
  name        = "Zenya Cache Rules"
  description = "Custom cache rules for Zenya"
  kind        = "zone"
  phase       = "http_request_cache_settings"
  
  # Cache static assets
  rules {
    action = "set_cache_settings"
    action_parameters {
      cache = true
      edge_ttl {
        mode    = "override_origin"
        default = 86400 # 1 day
      }
      browser_ttl {
        mode    = "override_origin"
        default = 3600 # 1 hour
      }
    }
    expression  = "(http.request.uri.path.extension in {\"js\" \"css\" \"jpg\" \"jpeg\" \"png\" \"gif\" \"ico\" \"woff\" \"woff2\"})"
    description = "Cache static assets"
    enabled     = true
  }
}

# Transform Rules for Headers
resource "cloudflare_ruleset" "zenya_headers" {
  zone_id     = data.cloudflare_zone.zenya.id
  name        = "Zenya Security Headers"
  description = "Add security headers to responses"
  kind        = "zone"
  phase       = "http_response_headers_transform"
  
  rules {
    action = "rewrite"
    action_parameters {
      headers {
        name      = "X-Frame-Options"
        operation = "set"
        value     = "DENY"
      }
      headers {
        name      = "X-Content-Type-Options"
        operation = "set"
        value     = "nosniff"
      }
      headers {
        name      = "Referrer-Policy"
        operation = "set"
        value     = "strict-origin-when-cross-origin"
      }
      headers {
        name      = "Permissions-Policy"
        operation = "set"
        value     = "camera=(), microphone=(), geolocation=()"
      }
    }
    expression  = "true"
    description = "Add security headers"
    enabled     = true
  }
}

# Load Balancer (if using multiple origins)
resource "cloudflare_load_balancer" "zenya_lb" {
  zone_id          = data.cloudflare_zone.zenya.id
  name             = "zenya-lb"
  fallback_pool_id = cloudflare_load_balancer_pool.zenya_primary.id
  default_pool_ids = [cloudflare_load_balancer_pool.zenya_primary.id]
  description      = "Load balancer for Zenya"
  proxied          = true
  
  session_affinity         = "cookie"
  session_affinity_ttl     = 3600
  session_affinity_attributes {
    samesite = "strict"
    secure   = "always"
  }
}

resource "cloudflare_load_balancer_pool" "zenya_primary" {
  name               = "zenya-primary-pool"
  minimum_origins    = 1
  notification_email = var.notification_email
  
  origins {
    name    = "vercel-primary"
    address = "76.76.21.21"
    enabled = true
    weight  = 1
  }
  
  check_regions = ["WNAM", "ENAM", "WEU", "EEU"]
}