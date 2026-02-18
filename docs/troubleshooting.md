# Troubleshooting Guide

Common issues and their solutions when working with MCP servers.

## 🔧 Installation Issues

### Issue: `npm install` fails

**Symptoms:**
```
npm ERR! code ENOENT
npm ERR! syscall open
```

**Solution:**
1. Ensure you're in the project directory
2. Check Node.js version: `node --version` (should be 18+)
3. Clear npm cache: `npm cache clean --force`
4. Delete `node_modules` and retry: `rm -rf node_modules && npm install`

### Issue: TypeScript compilation fails

**Symptoms:**
```
error TS2307: Cannot find module '@modelcontextprotocol/sdk'
```

**Solution:**
1. Ensure dependencies are installed: `npm install`
2. Check `tsconfig.json` exists
3. Verify `package.json` has correct dependencies
4. Try: `npm install --save-dev @types/node`

## 🚀 Runtime Issues

### Issue: Server doesn't start

**Symptoms:**
```
node build/index.js
# No output, hangs
```

**Solution:**
This is **expected behavior**! The server waits for input on stdin.

**Test it properly:**
```bash
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node build/index.js
```

### Issue: "Cannot find module" error

**Symptoms:**
```
Error: Cannot find module './build/index.js'
```

**Solution:**
1. Build the project first: `npm run build`
2. Verify `build/index.js` exists
3. Use absolute path if needed: `node /full/path/to/build/index.js`

### Issue: JSON parse error

**Symptoms:**
```
Unexpected token
SyntaxError: Unexpected end of JSON input
```

**Solution:**
1. Verify your JSON is valid
2. Use a JSON validator
3. Check for:
   - Missing commas
   - Trailing commas
   - Unescaped quotes
   - Missing brackets

**Example of valid request:**
```json
{
  "jsonrpc": "2.0",
  "method": "tools/list",
  "id": 1
}
```

## 🔌 Client Connection Issues

### Issue: Claude Desktop doesn't see the server

**Symptoms:**
- Server not listed in Claude Desktop
- Tools don't appear

**Solution:**
1. **Check config file location:**
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

2. **Verify config format:**
```json
{
  "mcpServers": {
    "notes": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/build/index.js"]
    }
  }
}
```

3. **Use absolute paths** - relative paths may not work

4. **Restart Claude Desktop** after config changes

5. **Check server builds:** Run `npm run build` first

### Issue: Server crashes on connection

**Symptoms:**
```
Server error: ...
process.exit(1)
```

**Solution:**
1. Check stderr for error messages
2. Verify Node.js version (18+)
3. Ensure all dependencies installed
4. Check file permissions

## 🛠️ Tool Execution Issues

### Issue: Tool not found

**Symptoms:**
```json
{
  "error": {
    "message": "Unknown tool: create_notes"
  }
}
```

**Solution:**
1. **Check tool name** - It's `create_note` not `create_notes`
2. List available tools to verify:
```bash
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node build/index.js
```

### Issue: Invalid parameters

**Symptoms:**
```json
{
  "error": {
    "message": "Invalid params"
  }
}
```

**Solution:**
1. Check the tool's `inputSchema` in `src/index.ts`
2. Verify all required parameters are provided
3. Check parameter types match (string vs array, etc.)

**Example:**
```json
// ❌ Wrong - title is required
{
  "name": "create_note",
  "arguments": {
    "content": "My content"
  }
}

// ✅ Correct
{
  "name": "create_note",
  "arguments": {
    "title": "My Note",
    "content": "My content"
  }
}
```

### Issue: Tool returns error

**Symptoms:**
```json
{
  "content": [{
    "type": "text",
    "text": "Error: Note with ID 123 not found"
  }],
  "isError": true
}
```

**Solution:**
This is expected for invalid operations. The error message explains the problem:
- Note doesn't exist
- Invalid ID
- Missing data

**Fix:** Use correct ID or create the note first.

## 📊 Resource Issues

### Issue: Resource not found

**Symptoms:**
```json
{
  "error": {
    "message": "Unknown resource: notes://wrong"
  }
}
```

**Solution:**
1. List available resources:
```bash
echo '{"jsonrpc":"2.0","method":"resources/list","id":1}' | node build/index.js
```

2. Use exact URI from the list
3. URIs are case-sensitive

**Available URIs:**
- `notes://all`
- `notes://summary`

## 💬 Prompt Issues

### Issue: Prompt not found

**Symptoms:**
```json
{
  "error": {
    "message": "Unknown prompt: summarize"
  }
}
```

**Solution:**
1. List available prompts:
```bash
echo '{"jsonrpc":"2.0","method":"prompts/list","id":1}' | node build/index.js
```

2. Use exact name from the list

**Available prompts:**
- `summarize_notes`
- `organize_notes`

## 🐛 Debugging Techniques

### Enable Verbose Logging

**Method 1: Environment Variable**
```bash
DEBUG=* node build/index.js
```

**Method 2: Code Modification**
Add to `src/index.ts`:
```typescript
console.error('Request received:', JSON.stringify(request, null, 2));
console.error('Response:', JSON.stringify(response, null, 2));
```

Then rebuild: `npm run build`

### Test Individual Components

**Test JSON-RPC parsing:**
```bash
# Send invalid JSON
echo 'invalid' | node build/index.js

# Should see parse error
```

**Test specific tool:**
```bash
# Create a note
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"create_note","arguments":{"title":"Test","content":"Content"}},"id":1}' | node build/index.js
```

**Test resource reading:**
```bash
# Read summary
echo '{"jsonrpc":"2.0","method":"resources/read","params":{"uri":"notes://summary"},"id":1}' | node build/index.js
```

### Check Process Communication

**Verify stdio works:**
```bash
# Should echo back
echo "test" | node -e "process.stdin.pipe(process.stdout)"
```

**Test with simple server:**
```javascript
// test-server.js
process.stdin.on('data', (data) => {
  console.error('Received:', data.toString());
  console.log('{"result":"ok"}');
});
```

## 📱 Platform-Specific Issues

### macOS

**Issue: Permission denied**
```bash
chmod +x build/index.js
```

**Issue: Command not found**
```bash
# Use full path to node
/usr/local/bin/node build/index.js
```

### Windows

**Issue: Path separators**
Use forward slashes or escaped backslashes in config:
```json
"args": ["C:/path/to/build/index.js"]
// or
"args": ["C:\\path\\to\\build\\index.js"]
```

**Issue: No echo command**
Use PowerShell:
```powershell
'{"jsonrpc":"2.0","method":"tools/list","id":1}' | node build/index.js
```

### Linux

**Issue: Node not in PATH**
```bash
# Find node
which node

# Use full path
/usr/bin/node build/index.js
```

## 🔍 Advanced Debugging

### Capture Traffic

**Save input/output:**
```bash
# Input
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' > input.json
cat input.json | node build/index.js > output.json

# Check output
cat output.json
```

### Test with curl (HTTP transport)

If using HTTP transport:
```bash
curl -X POST http://localhost:3000 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

### Monitor Performance

**Add timing:**
```typescript
const start = Date.now();
// ... operation ...
console.error(`Operation took ${Date.now() - start}ms`);
```

### Memory Monitoring

```typescript
setInterval(() => {
  const used = process.memoryUsage();
  console.error('Memory:', Math.round(used.rss / 1024 / 1024), 'MB');
}, 5000);
```

## 🆘 When All Else Fails

### 1. Start Fresh

```bash
# Clean everything
rm -rf node_modules build package-lock.json

# Reinstall
npm install

# Rebuild
npm run build

# Test
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node build/index.js
```

### 2. Verify Prerequisites

```bash
# Check Node version
node --version  # Should be 18+

# Check npm version
npm --version

# Check TypeScript
npx tsc --version
```

### 3. Check File Integrity

```bash
# Verify key files exist
ls -la src/index.ts
ls -la package.json
ls -la tsconfig.json

# After build
ls -la build/index.js
```

### 4. Test Dependencies

```bash
# Verify SDK installed
npm list @modelcontextprotocol/sdk

# Should show version
```

## 📚 Error Reference

| Error Code | Meaning | Common Cause |
|------------|---------|--------------|
| -32700 | Parse error | Invalid JSON |
| -32600 | Invalid Request | Missing required fields |
| -32601 | Method not found | Wrong method name |
| -32602 | Invalid params | Wrong parameters |
| -32603 | Internal error | Server bug |

## 💡 Prevention Tips

1. **Always build before running:** `npm run build`
2. **Use absolute paths** in configuration
3. **Validate JSON** before sending
4. **Check tool names** against list
5. **Read error messages** carefully
6. **Test incrementally** - one thing at a time
7. **Keep logs** of what works
8. **Use version control** to track changes

## 🎓 Learning from Errors

Every error is a learning opportunity:

1. **Read the error message** - It usually tells you what's wrong
2. **Check the line number** - Go to that line in the code
3. **Understand the cause** - Why did this happen?
4. **Fix and test** - Make the change and verify
5. **Document it** - Remember the solution for next time

## 📞 Getting Help

If you're still stuck:

1. **Review documentation:**
   - [README.md](../README.md)
   - [concepts.md](concepts.md)
   - [usage.md](usage.md)

2. **Check examples:**
   - [examples/](../examples/)

3. **Read the code:**
   - [src/index.ts](../src/index.ts)

4. **Search online:**
   - MCP documentation
   - Stack Overflow
   - GitHub issues

---

**Remember:** Most issues are simple configuration or usage errors. Take your time, read the error messages, and debug systematically!
