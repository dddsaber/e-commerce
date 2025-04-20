import { Flex, Input, Select } from "antd";
import { useEffect, useState } from "react";
import AddressSkeleton from "./AddressSkeleton";

interface Province {
  code: string;
  name: string;
}

interface District {
  code: string;
  name: string;
}

interface Ward {
  code: string;
  name: string;
}

interface Address {
  province?: string;
  district?: string;
  ward?: string;
  details?: string;
}

interface AddressComponentProps {
  sendData: (address: Address | undefined) => void;
  user_address?: Address;
  isModify?: boolean;
}

export const getAllProvinces = async (): Promise<Province[]> => {
  const response = await fetch(
    `https://vn-public-apis.fpo.vn/provinces/getAll?limit=-1`
  );
  const data = await response.json();
  return data.data.data || [];
};

const AddressComponent: React.FC<AddressComponentProps> = ({
  sendData,
  user_address,
  isModify,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedWard, setSelectedWard] = useState<string | null>(null);
  const [details, setDetails] = useState<string>("");

  useEffect(() => {
    const fetchProvinces = async () => {
      setLoading(true);
      try {
        const data = await getAllProvinces();
        setProvinces(data);
      } catch (error) {
        console.error("Error fetching provinces:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    setSelectedDistrict(null);
    setSelectedWard(null);
    const fetchDistricts = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://vn-public-apis.fpo.vn/districts/getByProvince?provinceCode=${selectedProvince}&limit=-1`
        );
        const data = await response.json();
        setDistricts(data.data.data || []);
      } catch (error) {
        console.error("Error fetching districts:", error);
      } finally {
        setSelectedDistrict(null);
        setLoading(false);
      }
    };
    if (selectedProvince) {
      fetchDistricts();
    } else {
      setDistricts([]);
    }
  }, [selectedProvince]);

  useEffect(() => {
    setSelectedWard(null);
    const fetchWards = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://vn-public-apis.fpo.vn/wards/getByDistrict?districtCode=${selectedDistrict}&limit=-1`
        );
        const data = await response.json();
        setWards(data.data.data || []);
      } catch (error) {
        console.error("Error fetching wards:", error);
      } finally {
        setSelectedWard(null);
        setLoading(false);
      }
    };
    if (selectedDistrict) {
      fetchWards();
    } else {
      setWards([]);
    }
  }, [selectedDistrict]);

  useEffect(() => {
    if (user_address) {
      if (!selectedProvince)
        setSelectedProvince(
          provinces.find((p) => p.name === user_address.province)?.code || null
        );
      if (!selectedDistrict)
        setSelectedDistrict(
          districts.find((d) => d.name === user_address.district)?.code || null
        );
      if (!selectedWard)
        setSelectedWard(
          wards.find((w) => w.name === user_address.ward)?.code || null
        );
      setDetails(user_address.details || "");
    }
  }, [
    user_address,
    provinces,
    districts,
    wards,
    selectedProvince,
    selectedDistrict,
    selectedWard,
  ]);

  useEffect(() => {
    sendData({
      province: provinces.find((p) => p.code === selectedProvince)?.name || "",
      district: districts.find((d) => d.code === selectedDistrict)?.name || "",
      ward: wards.find((w) => w.code === selectedWard)?.name || "",
      details,
    });
  }, [
    selectedProvince,
    selectedDistrict,
    selectedWard,
    details,
    sendData,
    provinces,
    districts,
    wards,
  ]);

  return loading ? (
    <AddressSkeleton />
  ) : (
    <div style={{ width: 800 }}>
      <Flex justify="space-between">
        <label>Tỉnh/Thành Phố:</label>
        <Select
          style={{ width: "70%" }}
          placeholder="Chọn Tỉnh/Thành Phố"
          onChange={setSelectedProvince}
          value={selectedProvince || undefined}
          disabled={!isModify}
        >
          {provinces.map((province) => (
            <Select.Option key={province.code} value={province.code}>
              {province.name}
            </Select.Option>
          ))}
        </Select>
      </Flex>
      <Flex justify="space-between" style={{ marginTop: "10px" }}>
        <label>Quận/Huyện:</label>
        <Select
          style={{ width: "70%" }}
          placeholder="Chọn Quận/Huyện"
          onChange={setSelectedDistrict}
          value={selectedDistrict || undefined}
          disabled={!isModify}
        >
          {districts.map((district) => (
            <Select.Option key={district.code} value={district.code}>
              {district.name}
            </Select.Option>
          ))}
        </Select>
      </Flex>
      <Flex justify="space-between" style={{ marginTop: "10px" }}>
        <label>Phường/Xã:</label>
        <Select
          style={{ width: "70%" }}
          placeholder="Chọn Phường/Xã"
          onChange={setSelectedWard}
          value={selectedWard || undefined}
          disabled={!isModify}
        >
          {wards.map((ward) => (
            <Select.Option key={ward.code} value={ward.code}>
              {ward.name}
            </Select.Option>
          ))}
        </Select>
      </Flex>
      <Flex justify="space-between" style={{ marginTop: "10px" }}>
        <label>Địa chỉ nhận hàng:</label>
        <Input
          style={{ width: "70%" }}
          placeholder="Nhập địa chỉ nhận hàng"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          disabled={!isModify}
        />
      </Flex>
    </div>
  );
};

export default AddressComponent;
