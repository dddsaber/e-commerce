const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const modelProduct = require("../../models/Product.model");

async function askQuestion(question) {
  try {
    const products = await modelProduct.find({}, "name price image _id");

    const productHTML = products
      .map(
        (product) => `
      <div style="border: 1px solid #ddd; padding: 10px; margin: 10px 0; background-color: white;">
        ${
          product.image
            ? `<img src="http://localhost:5000/uploads/products/${product.image}" style="max-width: 100%; height: auto;"/>`
            : ""
        }
        <h3 style="font-size: 14px;">${product.name}</h3>
        <p style="margin: 4px 0;">${product.price} VND</p>
        ${
          product._id
            ? `<a href="http://localhost:5173/product/${product._id}" style="font-size: 13px;">Xem sản phẩm</a>`
            : ""
        }
      </div>
    `
      )
      .join("");

    const prompt = `
      Bạn là một trợ lý bán hàng chuyên nghiệp.
      
      Câu hỏi của khách hàng: "${question}"
      
      Nếu câu hỏi không liên quan đến sản phẩm, hãy trả lời một cách tự nhiên và thân thiện, không cần hiển thị danh sách sản phẩm.
      Nếu câu hỏi có liên quan tới sản phẩm, vui lòng phản hồi một cách chuyên nghiệp và khéo léo. Kèm theo đó, hiển thị các sản phẩm liên quan từ danh sách dưới đây theo định dạng HTML để dễ đọc hơn.
      
      Danh sách sản phẩm hiện có trong cửa hàng (hiển thị theo dạng HTML):
      ${productHTML}
      `;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    return response.text();
  } catch (err) {
    console.error(err);
    return "Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu của bạn.";
  }
}

module.exports = askQuestion;
