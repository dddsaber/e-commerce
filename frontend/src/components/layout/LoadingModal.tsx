import { Modal } from "antd";
import React from "react";
import "antd/dist/reset.css";
import "./LoadingModal.css";
import LoadingPage from "../../page/users/LoadingPage";
interface LoadingModelProps {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const LoadingModal: React.FC<LoadingModelProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
  return (
    <>
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        className="custom-modal"
        closable={false}
        maskClosable={false}
      >
        <LoadingPage />
      </Modal>
    </>
  );
};

export default LoadingModal;
