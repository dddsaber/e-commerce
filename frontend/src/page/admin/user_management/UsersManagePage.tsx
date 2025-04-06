import React, { useState } from "react";
import UserTable from "../../../components/users/UserTable";
import UserDrawer from "../../../components/users/UserDrawer";
import { User } from "../../../type/user.type";

const UsersManagePage: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [reload, setReload] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const onClose = () => {
    setSelectedUser(undefined);
    setIsVisible(false);
  };

  const showDrawer = () => {
    setIsVisible(true);
  };

  return (
    <div>
      <UserTable
        setSelectedUser={setSelectedUser}
        showDrawer={showDrawer}
        loading={loading}
        setLoading={setLoading}
        reload={reload}
        setReload={setReload}
      />
      <UserDrawer
        visible={isVisible}
        onClose={onClose}
        selectedUser={selectedUser}
        loading={loading}
        setSelectedUser={setSelectedUser}
        reload={reload}
        setReload={setReload}
      />
    </div>
  );
};

export default UsersManagePage;
