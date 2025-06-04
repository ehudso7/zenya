# Vercel Project Configuration
resource "vercel_project" "zenya" {
  name      = "zenya"
  framework = "nextjs"
  
  git_repository = {
    type = "github"
    repo = "${var.github_owner}/zenya"
  }
  
  build_command    = "npm run build"
  output_directory = ".next"
  install_command  = "npm ci"
  
  root_directory = ""
  
  environment = [
    {
      key    = "NEXT_PUBLIC_APP_URL"
      value  = "https://zenyaai.com"
      target = ["production"]
    },
    {
      key    = "NEXT_PUBLIC_SUPABASE_URL"
      value  = var.supabase_url
      target = ["production", "preview", "development"]
    },
    {
      key    = "NEXT_PUBLIC_SUPABASE_ANON_KEY"
      value  = var.supabase_anon_key
      target = ["production", "preview", "development"]
    },
    {
      key    = "SUPABASE_SERVICE_ROLE_KEY"
      value  = var.supabase_service_role_key
      target = ["production", "preview", "development"]
    },
    {
      key    = "OPENAI_API_KEY"
      value  = var.openai_api_key
      target = ["production", "preview"]
    },
    {
      key    = "ANTHROPIC_API_KEY"
      value  = var.anthropic_api_key
      target = ["production", "preview"]
    },
    {
      key    = "UPSTASH_REDIS_REST_URL"
      value  = var.upstash_redis_rest_url
      target = ["production", "preview"]
    },
    {
      key    = "UPSTASH_REDIS_REST_TOKEN"
      value  = var.upstash_redis_rest_token
      target = ["production", "preview"]
    },
    {
      key    = "SENTRY_DSN"
      value  = var.sentry_dsn
      target = ["production", "preview"]
    },
    {
      key    = "SENTRY_AUTH_TOKEN"
      value  = var.sentry_auth_token
      target = ["production", "preview"]
    },
    {
      key    = "NEXT_PUBLIC_DATADOG_APPLICATION_ID"
      value  = var.datadog_application_id
      target = ["production"]
    },
    {
      key    = "NEXT_PUBLIC_DATADOG_CLIENT_TOKEN"
      value  = var.datadog_client_token
      target = ["production"]
    },
    {
      key    = "DD_AGENT_HOST"
      value  = var.datadog_agent_host
      target = ["production"]
    },
    {
      key    = "NEXT_PUBLIC_UNLEASH_URL"
      value  = var.unleash_url
      target = ["production", "preview"]
    },
    {
      key    = "NEXT_PUBLIC_UNLEASH_CLIENT_KEY"
      value  = var.unleash_client_key
      target = ["production", "preview"]
    }
  ]
  
  serverless_function_region = "iad1" # US East
}

# Production Domain
resource "vercel_project_domain" "zenya_production" {
  project_id = vercel_project.zenya.id
  domain     = "zenyaai.com"
}

resource "vercel_project_domain" "zenya_www" {
  project_id = vercel_project.zenya.id
  domain     = "www.zenyaai.com"
  
  redirect             = vercel_project_domain.zenya_production.domain
  redirect_status_code = 308
}

# Deployment Protection
resource "vercel_deployment_protection" "zenya_production" {
  project_id = vercel_project.zenya.id
  enabled    = true
}

# Edge Config for feature flags and configuration
resource "vercel_edge_config" "zenya_config" {
  name = "zenya-config"
}

resource "vercel_edge_config_item" "feature_flags" {
  edge_config_id = vercel_edge_config.zenya_config.id
  key            = "feature_flags"
  value = jsonencode({
    ai_providers     = true
    advanced_analytics = true
    gamification     = true
    social_learning  = false
    offline_mode     = false
  })
}

resource "vercel_edge_config_item" "rate_limits" {
  edge_config_id = vercel_edge_config.zenya_config.id
  key            = "rate_limits"
  value = jsonencode({
    ai_endpoint = {
      window = "1m"
      limit  = 20
    }
    auth_endpoint = {
      window = "1m"
      limit  = 5
    }
    api_endpoint = {
      window = "1m"
      limit  = 30
    }
  })
}

# Edge Config Token
resource "vercel_edge_config_token" "zenya_token" {
  edge_config_id = vercel_edge_config.zenya_config.id
  label          = "Production Token"
}

# Add Edge Config to project
resource "vercel_project_environment_variable" "edge_config" {
  project_id = vercel_project.zenya.id
  key        = "EDGE_CONFIG"
  value      = vercel_edge_config_token.zenya_token.connection_string
  target     = ["production", "preview", "development"]
}

# Monitoring Integration
resource "vercel_integration_configuration" "datadog" {
  integration_id = "oac_5hKQmleT8Zv1QXvLgUuCLDVX" # Datadog integration ID
  
  team_id              = var.vercel_team_id
  source               = "marketplace"
  source_configuration = {
    projects = [vercel_project.zenya.id]
  }
}