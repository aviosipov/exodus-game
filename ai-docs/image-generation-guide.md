# Guide: Generating Image Assets for Exodus Game

This guide outlines the process used to generate background and character images for the Exodus game using the Replicate AI platform via the `mcp-replicate` MCP server.

## Prerequisites

1.  **`mcp-replicate` Server Installed:** Ensure the `mcp-replicate` server is installed globally (`npm install -g mcp-replicate`) and configured in your MCP client settings (e.g., Cline, Claude Desktop) with your Replicate API token. See installation steps below if needed.
2.  **MCP Client:** An MCP client (like Cline) capable of interacting with the server.

## Installation (if not already done)

1.  **Install Node.js:** Ensure you have Node.js installed.
2.  **Install MCP Server:**
    ```bash
    npm install -g mcp-replicate
    ```
3.  **Configure MCP Client:** Add the server to your client's configuration file (e.g., `cline_mcp_settings.json`), providing your Replicate API token:
    ```json
    {
      "mcpServers": {
        "mcp-replicate": {
          "command": "mcp-replicate",
          "env": {
            "REPLICATE_API_TOKEN": "YOUR_REPLICATE_API_TOKEN_HERE"
          },
          "disabled": false,
          "autoApprove": []
        }
        // ... other servers
      }
    }
    ```

## Image Generation Process

We use the `mcp-replicate` server's `create_prediction` and `get_prediction` tools.

### 1. Generating the Base Image

*   **Model:** `black-forest-labs/flux-1.1-pro`
*   **Tool:** `create_prediction`

**Example (Background Image):**

```json
// Tool arguments for create_prediction
{
  "model": "black-forest-labs/flux-1.1-pro",
  "input": {
    "prompt": "Panoramic view of the fertile Nile delta in ancient Egypt during a time of prosperity. Shows a mix of grand Hebrew estates and Egyptian dwellings, lush fields, livestock grazing. Egyptians and Hebrews interact respectfully in daily activities. The overall mood is peaceful and prosperous, under a clear blue sky with the sun shining. Style: Epic historical landscape painting.",
    "aspect_ratio": "16:9" // Or other desired ratio like "9:16" for portraits
  }
}
```

*   **Prompt Engineering:** Craft a detailed prompt describing the scene, characters, mood, and desired style.
*   **Aspect Ratio:** Specify the desired aspect ratio (e.g., "16:9" for backgrounds, "9:16" for character portraits).

### 2. Checking Prediction Status

*   The `create_prediction` tool returns a prediction ID.
*   Use the `get_prediction` tool repeatedly with the ID until the `status` is `succeeded`.

**Example:**

```json
// Tool arguments for get_prediction
{
  "prediction_id": "PREDICTION_ID_FROM_STEP_1"
}
```

*   The result will contain the URL of the generated image in the `output` field.

### 3. Removing Background (Optional - for Characters/Objects)

*   **Model:** `lucataco/remove-bg` (Version: `95fcc2a26d3899cd6c2691c900465aaeff466285a65c14638cc5f36f34befaf1`)
*   **Tool:** `create_prediction`

**Example (Character Avatar Background Removal):**

```json
// Tool arguments for create_prediction
{
  "version": "95fcc2a26d3899cd6c2691c900465aaeff466285a65c14638cc5f36f34befaf1",
  "input": {
    "image": "URL_OF_IMAGE_FROM_STEP_2" // Use the output URL from the generation step
  }
}
```

*   Check the status using `get_prediction` as in Step 2. The output URL will point to the image with the background removed (usually a PNG with transparency).

### 4. Downloading the Image

*   Use a command-line tool like `curl` to download the final image URL obtained from Step 2 or Step 3.

**Example:**

```bash
# Create directory if it doesn't exist
mkdir -p public/images

# Download the image (replace URL and filename)
curl -o public/images/your_image_name.webp "IMAGE_URL_HERE"
# or for PNGs:
curl -o public/images/your_image_name.png "IMAGE_URL_HERE"

```

### 5. Placing and Using the Image

*   Place downloaded images in the `public/images/` directory of the Next.js project.
*   Reference them in your components using root-relative paths (e.g., `src="/images/your_image_name.png"`).

## Summary of Assets Created

*   **Background:** `public/images/ancient_egypt_prosperity_bg.webp`
    *   Generated using `black-forest-labs/flux-1.1-pro` with a 16:9 aspect ratio.
*   **Character Avatar (Ohed):** `public/images/ohed_avatar_nobg.png`
    *   Generated using `black-forest-labs/flux-1.1-pro` with a 9:16 aspect ratio.
    *   Background removed using `lucataco/remove-bg`.
