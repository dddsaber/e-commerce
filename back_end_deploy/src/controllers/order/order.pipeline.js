const getOrderProjection = () => ({
  $project: {
    _id: 1,
    address: 1,
    shippingFee: 1,
    total: 1,
    status: 1,
    statusTimestamps: 1,
    customerNote: 1,
    staffNote: 1,
    cancelNote: 1,
    distance: 1,
    description: 1,
    fees: 1,
    createdAt: 1,
    updatedAt: 1,
    "store._id": 1,
    "store.name": 1,
    "store.logo": 1,
    "orderDetails.product.name": 1,
    "orderDetails.product._id": 1,
    "orderDetails.product.image": 1,
    "orderDetails.quantity": 1,
    "orderDetails.price": 1,
    "orderDetails.discount": 1,
    "orderDetails._id": 1,
    "coupon._id": 1,
    "coupon.name": 1,
    "coupon.type": 1,
    "coupon.value": 1,
    "payment._id": 1,
    "payment.name": 1,
    "user._id": 1,
    "user.name": 1,
    "user.username": 1,
    "delivery._id": 1,
    "delivery.courier": 1,
    "delivery.trackingNumber": 1,
    "delivery.estimatedDate": 1,
    "delivery.deliveredDate": 1,
    "delivery.failedReason": 1,
    "delivery.recipientName": 1,
    "delivery.phoneNumber": 1,
    "delivery.address": 1,
    "delivery.postalCode": 1,
    "delivery.shippingFee": 1,
    "delivery.codAmount": 1,
    "delivery.paymentStatus": 1,
    "delivery.deliveryLogs.timestamp": 1,
    "delivery.deliveryLogs.location": 1,
    "delivery.deliveryLogs.warehouseInfo._id": 1,
    "delivery.deliveryLogs.warehouseInfo.name": 1,
    "delivery.deliveryLogs.warehouseInfo.address": 1,
    "delivery.status": 1,
  },
});
const getDeliveryLookupStages = () => [
  // B1: Lookup delivery
  {
    $lookup: {
      from: "deliveries",
      localField: "_id",
      foreignField: "orderId",
      as: "deliveryInfo",
    },
  },
  {
    $addFields: {
      delivery: { $arrayElemAt: ["$deliveryInfo", 0] },
    },
  },

  // B2: Unwind từng log để lookup location (warehouse)
  {
    $unwind: {
      path: "$delivery.deliveryLogs",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $lookup: {
      from: "warehouses",
      let: { locationId: "$delivery.deliveryLogs.location" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$_id", "$$locationId"] },
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            address: 1,
          },
        },
      ],
      as: "warehouseInfo",
    },
  },
  {
    $addFields: {
      "delivery.deliveryLogs.warehouseInfo": {
        $arrayElemAt: ["$warehouseInfo", 0],
      },
    },
  },

  // B3: Gom lại mảng logs
  {
    $group: {
      _id: "$_id",
      doc: { $first: "$$ROOT" },
      logs: { $push: "$delivery.deliveryLogs" },
    },
  },
  {
    $addFields: {
      "doc.delivery.deliveryLogs": {
        $map: {
          input: "$logs",
          as: "log",
          in: {
            $mergeObjects: ["$$log", { warehouseInfo: "$$log.warehouseInfo" }],
          },
        },
      },
    },
  },
  {
    $replaceRoot: {
      newRoot: "$doc",
    },
  },

  // B4: Cleanup
  {
    $unset: ["deliveryInfo", "warehouseInfo"],
  },
];

const getStoreLookupStages = () => [
  {
    $lookup: {
      from: "stores",
      localField: "storeId",
      foreignField: "_id",
      as: "storeInfo",
    },
  },
  {
    $addFields: {
      store: { $arrayElemAt: ["$storeInfo", 0] },
    },
  },
  {
    $unwind: {
      path: "$store",
      preserveNullAndEmptyArrays: true,
    },
  },
];

const getProductLookupStages = () => [
  {
    $lookup: {
      from: "products",
      localField: "orderDetails.productId",
      foreignField: "_id",
      as: "productInfo",
    },
  },
  {
    $addFields: {
      orderDetails: {
        $map: {
          input: "$orderDetails",
          as: "detail",
          in: {
            $mergeObjects: [
              "$$detail",
              {
                product: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$productInfo",
                        as: "prod",
                        cond: { $eq: ["$$prod._id", "$$detail.productId"] },
                      },
                    },
                    0,
                  ],
                },
              },
            ],
          },
        },
      },
    },
  },
  {
    $unset: "productInfo",
  },
];

const getUserLookupStages = () => [
  {
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "user",
    },
  },
  {
    $addFields: {
      user: { $arrayElemAt: ["$user", 0] },
    },
  },
  {
    $unwind: {
      path: "$user",
      preserveNullAndEmptyArrays: true,
    },
  },
];

const getPaymentLookupStages = () => [
  {
    $lookup: {
      from: "payments",
      localField: "paymentId",
      foreignField: "_id",
      as: "payment",
    },
  },
  {
    $addFields: {
      payment: { $arrayElemAt: ["$payment", 0] },
    },
  },
  {
    $unwind: {
      path: "$payment",
      preserveNullAndEmptyArrays: true,
    },
  },
];

module.exports = {
  getOrderProjection,
  getDeliveryLookupStages,
  getStoreLookupStages,
  getProductLookupStages,
  getUserLookupStages,
  getPaymentLookupStages,
};
