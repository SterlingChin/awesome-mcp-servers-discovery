# Awesome MCP Servers Discovery

A specialized Model Context Protocol (MCP) server that provides intelligent search and recommendations for MCP servers from the curated [awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers) repository.

**🎯 Purpose**: Help you discover the perfect MCP server for your specific needs by analyzing problem descriptions and providing ranked recommendations.

## Features

- **🔍 Smart Recommendations**: Get AI-powered suggestions based on your problem description
- **📋 Complete Catalog**: Browse all 300+ MCP servers with metadata parsing
- **🏷️ Category Filtering**: Filter servers by categories like Database, AI, Automation, etc.
- **⚡ Real-time Data**: Always fetches the latest data from the awesome-mcp-servers repository
- **🎯 Relevance Scoring**: Intelligent matching algorithm ranks servers by relevance

## Tools Available

### 1. `recommend-mcp-servers`
Analyzes your problem and recommends the most relevant MCP servers.

**Parameters:**
- `problem` (required): Describe what you need help with
- `maxResults` (optional): Number of recommendations (default: 5)
- `language` (optional): Preferred programming language (Python, TypeScript, Go, Rust, etc.)
- `hosting` (optional): "cloud", "local", or "any" (default: "any")

### 2. `get-awesome-mcp-servers`
Browse the complete catalog of MCP servers with optional filtering.

**Parameters:**
- `category` (optional): Filter by category name

## Installation

1. Clone this repository:
   ```bash
   git clone <your-repo-url>
   cd open-source-mcp-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the server:
   ```bash
   npm run build
   ```

## Usage

### Running the Server

```bash
node build/index.js
```

### Integration with Claude Desktop

Add this server to your Claude Desktop configuration (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "awesome-mcp-servers": {
      "command": "node",
      "args": ["/absolute/path/to/your/build/index.js"]
    }
  }
}
```

## Example Queries

### Problem-Based Recommendations

**Query**: *"I need to work with PostgreSQL databases"*
```typescript
recommend-mcp-servers({
  problem: "PostgreSQL database integration",
  language: "Python",
  hosting: "local",
  maxResults: 3
})
```

**Result**: Returns Python-based, locally-hosted PostgreSQL MCP servers with relevance scores.

### Browse by Category

**Query**: *"Show me all database-related MCP servers"*
```typescript
get-awesome-mcp-servers({
  category: "Database"
})
```

**Result**: Lists all 65+ database MCP servers with descriptions, languages, and links.

### General Discovery

**Query**: *"What MCP servers help with file automation?"*
```typescript
recommend-mcp-servers({
  problem: "file automation and management",
  maxResults: 5
})
```

## How It Works

### Data Parsing
The server fetches and parses the awesome-mcp-servers README.md to extract:

- **Server names and descriptions**
- **Programming languages**: 🐍 Python, 📇 TypeScript, 🏎️ Go, 🦀 Rust, etc.
- **Hosting types**: ☁️ Cloud, 🏠 Local
- **Platform support**: 🍎 macOS, 🪟 Windows, 🐧 Linux
- **Categories**: Database, AI & Machine Learning, Automation, etc.

### Recommendation Algorithm
The relevance scoring considers:

1. **Exact phrase matches** (highest weight: +100)
2. **Individual keyword matches** (+10 per match)
3. **Category alignment** (+50)
4. **Language preferences** (+20)
5. **Hosting requirements** (+15)

### Available Categories

The server recognizes these categories from awesome-mcp-servers:
- Aggregators
- AI & Machine Learning  
- Art & Culture
- Browser Automation
- Cloud Platforms
- Code Execution
- Coding Agents
- Command Line
- Communication
- Customer Data Platforms
- **Databases** (65+ servers)
- Data Platforms
- Data Science Tools
- Developer Tools
- File Systems
- And many more...

## Real-World Examples

### Database Integration
**Problem**: "I need to connect my AI to a MySQL database"
**Recommendation**: mysql_mcp_server_pro, mcp-mysql-server, runekaagaard/mcp-alchemy

### PDF Processing  
**Problem**: "Help me work with PDF files"
**Recommendation**: pdf-tools-mcp, various document processing servers

### macOS Automation
**Problem**: "Automate tasks on my Mac"
**Recommendation**: rusiaaman/wcgw, NakaokaRei/swift-mcp-gui, apple-notes-mcp

## Development

### Tech Stack
- **TypeScript** with strict type checking
- **Model Context Protocol SDK** for server implementation  
- **Zod** for runtime schema validation
- **Node.js** 20+ runtime

### Project Structure
```
├── index.ts          # Main server implementation
├── build/            # Compiled JavaScript output
├── package.json      # Dependencies and scripts
├── tsconfig.json     # TypeScript configuration
└── README.md         # This file
```

### Building from Source
```bash
npm run build    # Compile TypeScript
npm run start    # Run the server
npm run dev      # Build and run in one step
```

## Contributing

Contributions are welcome! This server specifically focuses on the awesome-mcp-servers repository. 

### Enhancement Ideas
- Add caching for faster responses
- Implement fuzzy string matching for better search
- Add server health/popularity metrics
- Support for custom scoring weights

## License

MIT License

---

**🔗 Related Projects**
- [awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers) - The curated list this server analyzes
- [Model Context Protocol](https://modelcontextprotocol.io/) - The official MCP specification