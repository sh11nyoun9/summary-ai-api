import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req, res) {
    const allowedOrigin = "https://sh11nyoun9.github.io"
    
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if(req.method === "OPTIONS") {
        return res.status(200).end();
    }
    
    const{type, title} = req.body;
    if(!type || !title) {
        return res.status(400).json({error: "유형(type)과 제목(title)이 필요합니다."});
    }

    try {
        const today = new Date().toISOString().slice(0, 10);
        const prompt = `
        작품 유형: ${type}
        작품 제목: ${title}

        위 작품의 줄거리를 핵심만 요약해서 설명해 주세요. 
        - 4~5문장으로 간결하게 작성해 주세요.
        - 내용의 핵심을 요약하되, 이해하기 쉽게 써 주세요.
        - 결말 스포일러는 포함하지 마세요.
        `;

        const result = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
            config: {
                systemInstruction:
                "당신은 영화 및 도서 줄거리 요약 전문가입니다. 사람들이 작품을 보기 전에 흥미를 가질 수 있도록, 핵심 내용을 명확하고 간단히 요약해 주세요. 결말은 포함하지 마시고, 스포일러 없이 구성해 주세요."
            },
        });
        
        res.status(200).json({answer: result.text});
    } catch (err) {
        console.error(err);
        res.status(500).json({error:"Gemini API 오류 발생"});
    }
}
