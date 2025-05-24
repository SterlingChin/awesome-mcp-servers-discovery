import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create server instance
const server = new McpServer({
  name: "awesome-mcp-servers",
  version: "1.0.0"
});

// GitHub raw content base URL
const GITHUB_RAW_BASE = "https://raw.githubusercontent.com";

// Helper function to fetch raw file content from awesome-mcp-servers repo
async function fetchAwesomeMcpServersReadme(): Promise<string> {
  const url = `${GITHUB_RAW_BASE}/punkpeye/awesome-mcp-servers/main/README.md`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch awesome-mcp-servers README: ${response.status} ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error(`Error fetching awesome-mcp-servers README:`, error);
    throw error;
  }
}

// Tool: Get awesome MCP servers list
server.tool(
  "get-awesome-mcp-servers",
  "Fetch and parse the awesome MCP servers list from the curated repository",
  {
    category: z.string().optional().describe("Filter by category (e.g., 'AI & Machine Learning', 'Development', 'Files')")
  },
  async ({ category }) => {
    try {
      const content = await fetchAwesomeMcpServersReadme();
      
      // Parse the content to extract server information
      const lines = content.split('\n');
      const servers: Array<{
        name: string;
        description: string;
        languages: string[];
        hosting: string[];
        platforms: string[];
        category: string;
        link: string;
      }> = [];
      
      let currentCategory = "";
      let inServerSection = false;
      
      for (const line of lines) {
        // Detect category headers (format: ### 🗄️ <a name="databases"></a>Databases)
        if (line.startsWith('### ') && line.includes('</a>')) {
          const match = line.match(/### .+<\/a>(.+)$/);
          if (match) {
            currentCategory = match[1].trim();
            inServerSection = true;
          }
          continue;
        }
        
        // Detect when we're out of server listings
        if (line.startsWith('## ') && (line.includes('Frameworks') || line.includes('Tips'))) {
          inServerSection = false;
          continue;
        }
        
        // Parse server entries (format: - [name](link) - description)
        if (inServerSection && line.startsWith('- ') && line.includes('[') && line.includes('](')) {
          const match = line.match(/- (.+?) - (.+)/);
          if (match) {
            const nameAndLink = match[1];
            const description = match[2];
            
            // Extract name and link
            const linkMatch = nameAndLink.match(/\[(.+?)\]\((.+?)\)/);
            if (linkMatch) {
              const name = linkMatch[1];
              const link = linkMatch[2];
              
              // Extract metadata (emojis and symbols)
              const languages: string[] = [];
              const hosting: string[] = [];
              const platforms: string[] = [];
              
              if (description.includes('🐍')) languages.push('Python');
              if (description.includes('📇')) languages.push('TypeScript/JavaScript');
              if (description.includes('🏎️')) languages.push('Go');
              if (description.includes('🦀')) languages.push('Rust');
              if (description.includes('#️⃣')) languages.push('C#');
              if (description.includes('☕')) languages.push('Java');
              
              if (description.includes('☁️')) hosting.push('Cloud');
              if (description.includes('🏠')) hosting.push('Local');
              
              if (description.includes('🍎')) platforms.push('macOS');
              if (description.includes('🪟')) platforms.push('Windows');
              if (description.includes('🐧')) platforms.push('Linux');
              
              // Clean description of emojis and symbols
              const cleanDescription = description
                .replace(/[🐍📇🏎️🦀#️⃣☕☁️🏠🍎🪟🐧🎖️]/g, '')
                .replace(/\s+/g, ' ')
                .trim();
              
              servers.push({
                name,
                description: cleanDescription,
                languages,
                hosting,
                platforms,
                category: currentCategory,
                link
              });
            }
          }
        }
      }
      
      // Filter by category if specified
      let filteredServers = servers;
      if (category) {
        filteredServers = servers.filter(server => 
          server.category.toLowerCase().includes(category.toLowerCase())
        );
      }
      
      // Format output
      let output = `# Awesome MCP Servers${category ? ` - ${category}` : ''}\n\n`;
      output += `Found ${filteredServers.length} servers${category ? ` in category "${category}"` : ''}:\n\n`;
      
      const categorizedServers = filteredServers.reduce((acc, server) => {
        if (!acc[server.category]) {
          acc[server.category] = [];
        }
        acc[server.category].push(server);
        return acc;
      }, {} as Record<string, typeof servers>);
      
      for (const [cat, catServers] of Object.entries(categorizedServers)) {
        if (cat) {
          output += `## ${cat}\n\n`;
        }
        
        for (const server of catServers) {
          output += `**${server.name}**\n`;
          output += `- Description: ${server.description}\n`;
          if (server.languages.length > 0) {
            output += `- Languages: ${server.languages.join(', ')}\n`;
          }
          if (server.hosting.length > 0) {
            output += `- Hosting: ${server.hosting.join(', ')}\n`;
          }
          if (server.platforms.length > 0) {
            output += `- Platforms: ${server.platforms.join(', ')}\n`;
          }
          output += `- Link: ${server.link}\n\n`;
        }
      }
      
      return {
        content: [{
          type: "text",
          text: output
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error fetching awesome MCP servers: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

// Tool: Recommend MCP servers for a specific problem
server.tool(
  "recommend-mcp-servers",
  "Analyze a problem and recommend relevant MCP servers from the awesome list",
  {
    problem: z.string().describe("Description of the problem or use case you need help with"),
    maxResults: z.number().optional().default(5).describe("Maximum number of recommendations to return"),
    language: z.string().optional().describe("Preferred programming language (Python, TypeScript, Go, Rust, etc.)"),
    hosting: z.enum(["cloud", "local", "any"]).optional().default("any").describe("Hosting preference")
  },
  async ({ problem, maxResults = 5, language, hosting }) => {
    try {
      // Fetch the servers list
      const content = await fetchAwesomeMcpServersReadme();
      
      // Parse servers (reusing logic from above)
      const lines = content.split('\n');
      const servers: Array<{
        name: string;
        description: string;
        languages: string[];
        hosting: string[];
        platforms: string[];
        category: string;
        link: string;
        relevanceScore?: number;
      }> = [];
      
      let currentCategory = "";
      let inServerSection = false;
      
      for (const line of lines) {
        if (line.startsWith('### ') && line.includes('</a>')) {
          const match = line.match(/### .+<\/a>(.+)$/);
          if (match) {
            currentCategory = match[1].trim();
            inServerSection = true;
          }
          continue;
        }
        
        if (line.startsWith('## ') && (line.includes('Frameworks') || line.includes('Tips'))) {
          inServerSection = false;
          continue;
        }
        
        if (inServerSection && line.startsWith('- ') && line.includes('[') && line.includes('](')) {
          const match = line.match(/- (.+?) - (.+)/);
          if (match) {
            const nameAndLink = match[1];
            const description = match[2];
            
            const linkMatch = nameAndLink.match(/\[(.+?)\]\((.+?)\)/);
            if (linkMatch) {
              const name = linkMatch[1];
              const link = linkMatch[2];
              
              const languages: string[] = [];
              const hostingTypes: string[] = [];
              const platforms: string[] = [];
              
              if (description.includes('🐍')) languages.push('Python');
              if (description.includes('📇')) languages.push('TypeScript');
              if (description.includes('🏎️')) languages.push('Go');
              if (description.includes('🦀')) languages.push('Rust');
              if (description.includes('#️⃣')) languages.push('C#');
              if (description.includes('☕')) languages.push('Java');
              
              if (description.includes('☁️')) hostingTypes.push('cloud');
              if (description.includes('🏠')) hostingTypes.push('local');
              
              if (description.includes('🍎')) platforms.push('macOS');
              if (description.includes('🪟')) platforms.push('Windows');
              if (description.includes('🐧')) platforms.push('Linux');
              
              const cleanDescription = description
                .replace(/[🐍📇🏎️🦀#️⃣☕☁️🏠🍎🪟🐧🎖️]/g, '')
                .replace(/\s+/g, ' ')
                .trim();
              
              servers.push({
                name,
                description: cleanDescription,
                languages,
                hosting: hostingTypes,
                platforms,
                category: currentCategory,
                link
              });
            }
          }
        }
      }
      
      // Calculate relevance scores
      const problemLower = problem.toLowerCase();
      const problemWords = problemLower.split(/\s+/);
      
      for (const server of servers) {
        let score = 0;
        const serverText = `${server.name} ${server.description} ${server.category}`.toLowerCase();
        
        // Exact phrase match (high score)
        if (serverText.includes(problemLower)) {
          score += 100;
        }
        
        // Individual word matches
        for (const word of problemWords) {
          if (word.length > 2 && serverText.includes(word)) {
            score += 10;
          }
        }
        
        // Category relevance
        if (server.category.toLowerCase().includes(problemLower)) {
          score += 50;
        }
        
        // Language preference bonus
        if (language && server.languages.some(lang => 
          lang.toLowerCase().includes(language.toLowerCase())
        )) {
          score += 20;
        }
        
        // Hosting preference bonus
        if (hosting !== "any" && server.hosting.includes(hosting)) {
          score += 15;
        }
        
        server.relevanceScore = score;
      }
      
      // Filter by hosting preference if specified
      let filteredServers = servers;
      if (hosting !== "any") {
        filteredServers = servers.filter(server => 
          server.hosting.length === 0 || server.hosting.includes(hosting)
        );
      }
      
      // Sort by relevance and take top results
      const topServers = filteredServers
        .filter(server => server.relevanceScore! > 0)
        .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
        .slice(0, maxResults);
      
      if (topServers.length === 0) {
        return {
          content: [{
            type: "text",
            text: `No MCP servers found that match the problem: "${problem}"\n\nTry using broader terms or check the full list with get-awesome-mcp-servers.`
          }]
        };
      }
      
      let output = `# MCP Server Recommendations for: "${problem}"\n\n`;
      output += `Found ${topServers.length} relevant servers:\n\n`;
      
      for (let i = 0; i < topServers.length; i++) {
        const server = topServers[i];
        output += `## ${i + 1}. ${server.name} (Score: ${server.relevanceScore})\n\n`;
        output += `**Description:** ${server.description}\n\n`;
        output += `**Category:** ${server.category}\n\n`;
        
        if (server.languages.length > 0) {
          output += `**Languages:** ${server.languages.join(', ')}\n\n`;
        }
        
        if (server.hosting.length > 0) {
          output += `**Hosting:** ${server.hosting.join(', ')}\n\n`;
        }
        
        if (server.platforms.length > 0) {
          output += `**Platforms:** ${server.platforms.join(', ')}\n\n`;
        }
        
        output += `**Link:** ${server.link}\n\n`;
        output += "---\n\n";
      }
      
      return {
        content: [{
          type: "text",
          text: output
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error recommending MCP servers: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Awesome MCP Servers Discovery Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});