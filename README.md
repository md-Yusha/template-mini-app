# VibeForge 🎬

**AI-powered onchain video editor for Farcaster**

VibeForge is a cyberpunk-themed, AI-powered video editor that runs as a Farcaster Mini App. Create, edit, and mint videos as NFTs on Base network with cutting-edge AI tools.

## 🚀 Features

### Video Editing

- **Multi-track Timeline**: Professional video editing with multiple tracks
- **Real-time Preview**: Live video preview with playback controls
- **Video Effects**: Apply brightness, contrast, saturation, blur, and rotation effects
- **Text Overlays**: Add customizable text to videos
- **Video Trimming**: Cut and trim video clips
- **Audio Extraction**: Extract audio from video files
- **Format Conversion**: Convert between MP4, WebM, and MOV formats

### AI-Powered Tools

- **Text-to-Image Generation**: Create images from text prompts using:
  - **Qwen/Qwen-Image** (Hugging Face) - High-quality image generation
  - **Stable Diffusion** models (Hugging Face & Stability AI)
  - **DALL-E** (OpenAI)
- **Image-to-Video**: Generate videos from images using AI models
- **Background Removal**: Remove backgrounds from images using AI
- **Speech-to-Text**: Convert audio to text using Whisper models
- **Multiple AI Providers**: Support for Hugging Face, OpenAI, and Stability AI

### File Management

- **Drag & Drop Upload**: Easy file upload with preview
- **IPFS Integration**: Upload and store videos on decentralized storage
- **Project Export**: Export finished projects to IPFS
- **Multiple Formats**: Support for video, audio, and image files

### Modern UI/UX

- **Cyberpunk Theme**: Beautiful dark theme with neon accents
- **Responsive Design**: Works on desktop and mobile
- **Real-time Updates**: Live timeline and preview updates
- **Smooth Animations**: Framer Motion animations throughout

## 🤖 AI Integration

### Hugging Face Models

VibeForge integrates with Hugging Face's inference API to provide access to state-of-the-art AI models:

#### Text-to-Image Models

- **Qwen/Qwen-Image**: High-quality image generation with excellent prompt understanding
- **Stable Diffusion 2.1**: Advanced image generation with improved quality
- **Stable Diffusion v1.5**: Fast and reliable image generation
- **Stable Diffusion v1.4**: Classic stable diffusion model

#### Image-to-Video Models

- **Damo-vilab/text-to-video-ms-1.7b**: Generate videos from text prompts
- **Cerspense/zeroscope_v2_XL**: High-quality video generation

#### Background Removal Models

- **Briaai/RMBG-1.4**: Professional background removal
- **Mattmdjaga/segformer_b2_clothes**: Specialized for clothing segmentation

#### Speech-to-Text Models

- **OpenAI/whisper-large-v3**: High-accuracy speech recognition
- **Facebook/wav2vec2-large-xlsr-53**: Multi-language speech recognition

### Setup AI Models

1. Get your Hugging Face API key from [Hugging Face](https://huggingface.co/settings/tokens)
2. Add it to your `.env` file:
   ```bash
   HUGGING_FACE_API_KEY=your_hugging_face_api_key_here
   ```
3. The app will automatically use Hugging Face models when available, with fallbacks to other providers

### Using AI Tools

1. Navigate to the "AI Tools" tab in the right panel
2. Select your desired AI tool (Text-to-Image, Image-to-Video, etc.)
3. Choose your preferred model from the dropdown
4. Enter your prompt and click "Generate"
5. Add the generated content to your timeline or download it

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Farcaster account
- API keys for AI services (optional)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/vibeforge.git
   cd vibeforge
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your configuration:

   ```env
   # Required
   NEXT_PUBLIC_URL=http://localhost:3000

   # Optional AI APIs
   OPENAI_API_KEY=your_openai_key
   STABILITY_API_KEY=your_stability_key

   # Optional IPFS
   WEB3_STORAGE_TOKEN=your_web3_storage_token

   # Optional Neynar (for notifications)
   NEYNAR_API_KEY=your_neynar_key
   NEYNAR_CLIENT_ID=your_client_id
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Development

### Project Structure

```
src/
├── app/                 # Next.js app router
│   ├── api/            # API routes
│   └── ...
├── components/         # React components
│   ├── ui/            # Reusable UI components
│   ├── VibeForge.tsx  # Main app component
│   ├── VideoPlayer.tsx # Video preview player
│   ├── Timeline.tsx   # Multi-track timeline
│   ├── AIPanel.tsx    # AI generation panel
│   └── ...
├── lib/               # Utilities and services
│   ├── store.ts       # Zustand state management
│   ├── ai.ts          # AI service utilities
│   ├── video.ts       # Video processing with ffmpeg.wasm
│   ├── ipfs.ts        # IPFS upload utilities
│   └── ...
└── ...
```

### Key Technologies

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **ffmpeg.wasm** - Video processing
- **Framer Motion** - Animations
- **React Dropzone** - File uploads
- **Web3.storage** - IPFS storage

### State Management

VibeForge uses Zustand for state management with the following stores:

- **Project state** - Current project, tracks, clips
- **Timeline state** - Playback, zoom, selection
- **AI state** - Generation requests and results
- **UI state** - Panels, modals, settings

## 🎯 Usage

### Creating a New Project

1. Launch VibeForge from the Farcaster feed
2. Click "New Project" in the top bar
3. Start adding media files via drag & drop

### Using AI Tools

1. Open the AI Assistant panel
2. Select an AI tool (Text-to-Image, etc.)
3. Enter your prompt
4. Click "Generate"
5. Use "Add to Timeline" to include in your project

### Editing Timeline

1. Drag clips to reposition them
2. Click clips to select and edit properties
3. Use the timeline ruler to navigate
4. Add multiple tracks for complex compositions

### Exporting & Minting

1. Click "Export" in the top bar
2. Choose resolution and format
3. Optionally mint as NFT on Base
4. Share your creation on Farcaster

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Environment Variables for Production

```env
NEXT_PUBLIC_URL=https://your-domain.vercel.app
OPENAI_API_KEY=your_production_key
WEB3_STORAGE_TOKEN=your_production_token
NEYNAR_API_KEY=your_production_key
```

### Base Beta Submission

1. Update `public/farcaster.json` with your domain
2. Generate proper account association signature
3. Submit to Base Beta program
4. Wait for approval

## 🔧 Configuration

### AI Services

- **OpenAI** - DALL-E 3, Whisper, background removal
- **Stability AI** - Stable Diffusion XL (alternative)
- **Custom models** - Extend `src/lib/ai.ts`

### Video Processing

- **ffmpeg.wasm** - Client-side video processing
- **Supported formats** - MP4, WebM, MOV, AVI
- **Max file size** - 100MB
- **Max duration** - 5 minutes

### IPFS Storage

- **Web3.storage** - Decentralized file storage
- **Metadata** - JSON files with video information
- **Gateways** - Multiple IPFS gateways for redundancy

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use semantic commit messages
- Add tests for new features
- Update documentation
- Follow the cyberpunk design system

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Farcaster** - Social protocol
- **Base** - L2 network
- **OpenAI** - AI models
- **ffmpeg.wasm** - Video processing
- **Web3.storage** - IPFS storage

## 🆘 Support

- **Documentation** - [docs.vibeforge.xyz](https://docs.vibeforge.xyz)
- **Discord** - [discord.gg/vibeforge](https://discord.gg/vibeforge)
- **Twitter** - [@vibeforge](https://twitter.com/vibeforge)
- **Issues** - [GitHub Issues](https://github.com/your-username/vibeforge/issues)

---

**Built with ❤️ for the Farcaster community**
