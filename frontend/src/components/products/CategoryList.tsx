import React from "react";
import { Card, Col, Row, Typography } from "antd";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import imgElectric from "../../assets/electric.jpg";
import imgCloths from "../../assets/cloths.png";
import imgHouse from "../../assets/house.jpg";
import imgMyPham from "../../assets/mypham.png";
import imgSport from "../../assets/sport.jpg";
import imgCar from "../../assets/car.jpg";
import imgBook from "../../assets/book.jpg";
import imgMom from "../../assets/mom.jpg";
import imgToy from "../../assets/toy.jpg";
import imgHealth from "../../assets/health.jpg";
import imgFood from "../../assets/food.jpg";
import imgDrink from "../../assets/drink.jpg";
import imgPet from "../../assets/pet.jpg";
import imgTravel from "../../assets/travel.jpg";
import imgOffice from "../../assets/office.jpg";
import imgTools from "../../assets/tools.jpg";

const categorydisplays = [
  {
    _id: "67d68cad994494baafa4fd16",
    name: "Điện tử",
    description: "Thiết bị và đồ công nghệ",
    image: imgElectric,
  },
  {
    _id: "67d68cbe994494baafa4fd18",
    name: "Thời trang",
    description: "Quần áo và phụ kiện",
    image: imgCloths,
  },
  {
    _id: "67d68cc6994494baafa4fd1a",
    name: "Nhà cửa & Đời sống",
    description: "Nội thất, trang trí và đồ dùng cần thiết",
    image: imgHouse,
  },
  {
    _id: "67d68cd0994494baafa4fd1c",
    name: "Làm đẹp & Sức khỏe",
    description: "Mỹ phẩm, chăm sóc da và sức khỏe",
    image: imgMyPham,
  },
  {
    _id: "67d68cd7994494baafa4fd1e",
    name: "Thể thao & Dã ngoại",
    description: "Dụng cụ thể thao và đồ ngoài trời",
    image: imgSport,
  },
  {
    _id: "67d68ce5994494baafa4fd20",
    name: "Ô tô & Xe máy",
    description: "Phụ tùng và phụ kiện xe",
    image: imgCar,
  },
  {
    _id: "67d68cf1994494baafa4fd22",
    name: "Sách & Văn phòng phẩm",
    description: "Sách, bút và đồ dùng học tập",
    image: imgBook,
  },
  {
    _id: "67d68cf8994494baafa4fd24",
    name: "Mẹ & Bé",
    description: "Sản phẩm cho mẹ và trẻ em",
    image: imgMom,
  },
  {
    _id: "67d68d00994494baafa4fd26",
    name: "Đồ chơi",
    description: "Đồ chơi cho trẻ em",
    image: imgToy,
  },
  {
    _id: "67d68d07994494baafa4fd28",
    name: "Sức khỏe",
    description: "Thực phẩm chức năng và y tế",
    image: imgHealth,
  },
  {
    _id: "67d68d13994494baafa4fd2a",
    name: "Thực phẩm",
    description: "Đồ ăn, thực phẩm khô và tươi",
    image: imgFood,
  },
  {
    _id: "67d68d1d994494baafa4fd2c",
    name: "Đồ uống",
    description: "Nước ngọt, trà, cà phê và đồ uống khác",
    image: imgDrink,
  },
  {
    _id: "67d68d25994494baafa4fd2e",
    name: "Vật nuôi",
    description: "Thức ăn và đồ dùng cho thú cưng",
    image: imgPet,
  },
  {
    _id: "67d68d2e994494baafa4fd30",
    name: "Du lịch",
    description: "Phụ kiện và dịch vụ du lịch",
    image: imgTravel,
  },
  {
    _id: "67d68d37994494baafa4fd32",
    name: "Thiết bị văn phòng",
    description: "Máy in, thiết bị và phụ kiện văn phòng",
    image: imgOffice,
  },
  {
    _id: "67d68d42994494baafa4fd34",
    name: "Công cụ & Dụng cụ",
    description: "Dụng cụ sửa chữa và xây dựng",
    image: imgTools,
  },
];

const CategoryList: React.FC = () => {
  const navigate = useNavigate(); // Initialize navigate

  const handleCategoryClick = (categoryId: string) => {
    // Redirect to SearchPage with categoryId as a query parameter
    navigate(`/search?categoryId=${categoryId}`);
  };

  return (
    <div style={{ margin: "15px 0" }}>
      <Card
        title="Danh mục"
        style={{
          marginBottom: 12,
          backgroundColor: "transparent",
          boxShadow: "none",
          border: "none",
        }}
        styles={{
          header: {
            textAlign: "center",
            fontSize: 25,
            textTransform: "capitalize",
            backgroundColor: "white",
          },
          body: {
            backgroundColor: "red",
            height: 1,
            padding: 0, // đảm bảo không có padding làm cao hơn 1px
          },
        }}
      >
        {/* Không có nội dung bên trong nên body chỉ hiển thị 1px chiều cao màu đỏ */}
      </Card>
      <Row gutter={[4, 4]}>
        {categorydisplays.map((cat) => (
          <Col key={cat._id} xs={12} sm={8} md={6} lg={4} xl={3}>
            <Card
              hoverable
              onClick={() => handleCategoryClick(cat._id)}
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              }}
              cover={
                <img
                  alt={cat.name}
                  src={cat.image}
                  style={{
                    height: 120,
                    width: "100%",
                    objectFit: "cover",
                  }}
                />
              }
            >
              <Typography.Title
                level={5}
                style={{ textAlign: "center", marginBottom: esp, fontSize: 14 }}
              >
                {cat.name}
              </Typography.Title>
              {/* <Typography.Paragraph style={{ textAlign: "center" }}>
                {cat.description}
              </Typography.Paragraph> */}
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default CategoryList;
