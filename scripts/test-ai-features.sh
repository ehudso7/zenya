#!/bin/bash

# Zenya AI Features Testing Script
# Run comprehensive tests on AI integration and fallback systems

echo "🤖 Zenya AI Features Testing Suite"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the project root
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Must run from project root directory${NC}"
    exit 1
fi

# Check if environment is set up
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}Warning: .env.local not found. Using .env.example as template${NC}"
    cp .env.example .env.local
    echo "Please configure your API keys in .env.local before running tests"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Create test results directory
mkdir -p test/results

# Function to run test with nice output
run_test() {
    local test_name=$1
    local test_file=$2
    
    echo -e "\n${YELLOW}Running: ${test_name}${NC}"
    echo "----------------------------------------"
    
    # Run the test
    npx ts-node "$test_file" > "test/results/${test_name}.log" 2>&1
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ ${test_name} completed successfully${NC}"
    else
        echo -e "${RED}❌ ${test_name} failed${NC}"
        echo "Check test/results/${test_name}.log for details"
    fi
}

# Run all AI tests
echo -e "\n${YELLOW}Starting AI Features Tests...${NC}\n"

# 1. Basic AI Features Test
run_test "ai-features" "test/ai-features-test.ts"

# 2. Edge Cases Test
run_test "ai-edge-cases" "test/ai-edge-cases-test.ts"

# 3. Generate Test Report
echo -e "\n${YELLOW}Generating test report...${NC}"
npx ts-node test/generate-ai-test-report.ts

# Summary
echo -e "\n${GREEN}Testing Complete!${NC}"
echo "=================="
echo ""
echo "📊 Results available at:"
echo "   - JSON: test/ai-test-results.json"
echo "   - HTML: test/ai-test-report.html"
echo "   - Summary: test/ai-test-summary.md"
echo "   - Logs: test/results/"
echo ""

# Open HTML report if on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Opening test report in browser..."
    open test/ai-test-report.html
fi