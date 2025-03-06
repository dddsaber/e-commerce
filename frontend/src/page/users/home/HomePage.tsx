import React from "react";
import ProductsList from "../../../components/products/ProductsList";
import CategoryList from "../../../components/products/CategoryList";
import ImageCarousel from "../../../components/products/ImageCarousel";

const HomePage: React.FC = () => {
  return (
    <div>
      <ImageCarousel />
      <CategoryList />
      <ProductsList />
    </div>
  );
};

export default HomePage;
