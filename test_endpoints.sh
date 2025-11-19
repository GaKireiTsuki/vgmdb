#!/bin/bash

echo "Testing format parameter behavior..."
echo ""

echo "Test 1: /hello without format parameter"
curl -s -i http://localhost:9990/hello 2>&1 | head -10
echo ""
echo "---"
echo ""

echo "Test 2: /albumlist/A1 without format parameter (should be JSON by default)"
echo "Headers:"
curl -s -I http://localhost:9990/albumlist/A1 2>&1 | grep -i "content-type"
echo ""

echo "Test 3: /albumlist/A1?format=json (explicitly JSON)"
echo "Headers:"
curl -s -I "http://localhost:9990/albumlist/A1?format=json" 2>&1 | grep -i "content-type"
echo ""

echo "Test 4: /albumlist/A1?format=yaml (explicitly YAML)"
echo "Headers:"
curl -s -I "http://localhost:9990/albumlist/A1?format=yaml" 2>&1 | grep -i "content-type"
echo ""
