import { Carousel, Col, Row } from "antd";
import React from "react";
import carousel1 from "../../assets/carousel1.jpg";
import carousel2 from "../../assets/carousel2.jpg";
import carousel4 from "../../assets/carousel4.jpg";

const ImageCarousel: React.FC = () => {
  return (
    <>
      <Row gutter={[6, 6]}>
        <Col span={16}>
          <Carousel autoplay arrows>
            <div>
              <img
                src={carousel1}
                alt="Sách mới ra mắt"
                style={{ width: "100%", height: "400px", objectFit: "cover" }}
              />
            </div>
            <div>
              <img
                src={carousel2}
                alt="Giảm giá đặc biệt"
                style={{ width: "100%", height: "400px", objectFit: "cover" }}
              />
            </div>
            <div>
              <img
                src={carousel4}
                alt="Khuyến mãi mua 1 tặng 1"
                style={{ width: "100%", height: "400px", objectFit: "cover" }}
              />
            </div>
          </Carousel>
        </Col>
        <Col span={8}>
          <div>
            <img
              src={carousel2}
              alt="Giảm giá đặc biệt"
              style={{ width: "100%", height: "198px", objectFit: "cover" }}
            />
          </div>
          <div>
            <img
              src={carousel4}
              alt="Khuyến mãi mua 1 tặng 1"
              style={{ width: "100%", height: "198px", objectFit: "cover" }}
            />
          </div>
        </Col>
      </Row>
    </>
  );
};

export default ImageCarousel;
