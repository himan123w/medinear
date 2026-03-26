// Helper to parse Google Vision API response
const parseVisionResponse = (visionResponse) => {
  const annotations = visionResponse?.responses?.[0]?.textAnnotations || [];
  if (annotations.length === 0) return '';
  // textAnnotations[0] contains full extracted text
  return annotations[0].description || '';
};

exports.extractTextFromImage = async (req, res, next) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ success: false, message: 'imageBase64 is required' });
    }

    const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;
    if (!apiKey) {
      return res.status(501).json({
        success: false,
        message: 'Google Cloud Vision API key is not configured. Please set GOOGLE_CLOUD_VISION_API_KEY in environment.'
      });
    }

    const requestBody = {
      requests: [
        {
          image: {
            content: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
          },
          features: [
            {
              type: 'TEXT_DETECTION',
              maxResults: 1,
            },
          ],
        },
      ],
    };

    const visionUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

    const response = await fetch(visionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      timeout: 30000,
    });

    if (!response.ok) {
      const responseText = await response.text();
      return res.status(response.status).json({
        success: false,
        message: 'Google Vision API request failed',
        details: responseText,
      });
    }

    const data = await response.json();
    const extractedText = parseVisionResponse(data);

    return res.json({ success: true, data: { extractedText, raw: data } });
  } catch (err) {
    console.error('Error in extractTextFromImage:', err);
    return res.status(500).json({ success: false, message: 'Failed to extract text from image', error: err.message || err });
  }
};
