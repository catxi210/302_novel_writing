import { env } from "@/env"
import ky from "ky"

interface IAiGenerateImage {
  data: {
    image_urls: string[],
  }
}

export const aiGenerateImage = async (params: { bookName: string, apiKey: string }) => {
  const { bookName, apiKey } = params
  try {
    const result = await ky(`${env.NEXT_PUBLIC_API_URL}/doubao/drawing`, {
      method: 'post',
      timeout: false,
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "prompt": `An illustrated book cover with the title:${bookName}`,
        "model_version": "general_v2.1_L",
        "req_schedule_conf": "general_v20_9B_pe",
        "llm_seed": -1,
        "seed": -1,
        "scale": 3.5,
        "ddim_steps": 25,
        "width": 512,
        "height": 768,
        "use_pre_llm": true,
        "use_sr": true,
        "sr_seed": -1,
        "sr_strength": 0.4,
        "sr_scale": 3.5,
        "sr_steps": 20,
        "is_only_sr": false,
        "return_url": true
      })
    }).then(response => response.json()) as IAiGenerateImage;
    if (result?.data?.image_urls.length) {
      return { src: result?.data?.image_urls[0] };
    }
    return { error: 'Generation failed' };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return error;
    } else if (error.response) {
      try {
        const errorData = await error.response.json();
        return errorData;
      } catch (parseError) {
        return { error: parseError }
      }
    } else {
      return { error: error.message }
    }
  }
}