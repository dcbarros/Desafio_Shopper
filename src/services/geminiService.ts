import { GoogleAIFileManager, FileState } from '@google/generative-ai/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

export class GeminiService {
  private fileManager: GoogleAIFileManager;
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.fileManager = new GoogleAIFileManager(apiKey);
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  private decodeBase64Image(dataString: string, outputPath: string): void {
    // console.log("Received Base64 String: ", dataString.slice(0, 50));
    const matches = dataString.match(/^(data:image\/[A-Za-z-+/]+;base64,)?(.+)$/);
    if (!matches || matches.length < 2) {
        throw new Error('Invalid Base64 image string');
    }
    
    const imageBuffer = Buffer.from(matches[2], 'base64');
    fs.writeFileSync(outputPath, imageBuffer);
  }

  async uploadImage(base64Image: string, mimeType: string, displayName: string): Promise<string> {
    try {

      const tempFilePath = path.join(__dirname, `${displayName}.jpg`);
      

      this.decodeBase64Image(base64Image, tempFilePath);

      const uploadResponse = await this.fileManager.uploadFile(tempFilePath, {
        mimeType,
        displayName,
      });


      fs.unlinkSync(tempFilePath);

      // console.log(`Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`);
      return uploadResponse.file.uri;
    } catch (error) {
      // console.error('Error uploading image:', error);
      throw new Error('Failed to upload image.');
    }
  }

  async checkFileState(fileName: string) {
    try {
      let file = await this.fileManager.getFile(fileName);
      while (file.state === FileState.PROCESSING) {
        process.stdout.write('.');
        await new Promise((resolve) => setTimeout(resolve, 10_000));
        file = await this.fileManager.getFile(fileName);
      }

      if (file.state === FileState.FAILED) {
        throw new Error('File processing failed.');
      }

      console.log(`File ${file.displayName} is ready for inference as ${file.uri}`);
      return file.uri;
    } catch (error) {
      // console.error('Error checking file state:', error);
      throw new Error('Failed to check file state.');
    }
  }

  async generateContentWithImage(imageUri: string, mimeType: string, prompt: string) {
    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-pro',
      });

      const result = await model.generateContent([
        {
          fileData: {
            mimeType,
            fileUri: imageUri,
          },
        },
        { text: prompt },
      ]);

      // console.log('Generated content:', result.response.text());
      return result.response.text();
    } catch (error) {
      // console.error('Error generating content:', error);
      throw new Error('Failed to generate content.');
    }
  }
}
