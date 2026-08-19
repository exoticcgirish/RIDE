const { randomUUID } = require("crypto");

let enabled = false;

const users = {
  rider: [],
  driver: [],
  admin: [],
};

const rideRequests = [];

const enable = () => {
  enabled = true;
};

const isEnabled = () => enabled;

const findUserByEmail = async (email) => {
  const lowercase = String(email || "").toLowerCase();

  for (const role of Object.keys(users)) {
    const user = users[role].find(
      (item) => String(item.email || "").toLowerCase() === lowercase
    );

    if (user) {
      return user;
    }
  }

  return null;
};

const findUserById = async (userId) => {
  for (const role of Object.keys(users)) {
    const user = users[role].find(
      (item) => String(item._id) === String(userId)
    );

    if (user) {
      return user;
    }
  }

  return null;
};

const createUser = async ({
  name,
  email,
  password,
  role,
  phone,
  vehicleType,
  vehicleNumber,
  vehicleModel,
  vehicleColor,
}) => {
  const selectedRole = ["rider", "driver", "admin"].includes(role)
    ? role
    : "rider";

  const user = {
    _id: randomUUID(),
    name,
    full_name: name,
    email,
    password,
    role: selectedRole,

    phone: phone || null,

    vehicleType:
      selectedRole === "driver"
        ? vehicleType || null
        : null,

    vehicleNumber:
      selectedRole === "driver"
        ? vehicleNumber || null
        : null,

    vehicleModel:
      selectedRole === "driver"
        ? vehicleModel || null
        : null,

    vehicleColor:
      selectedRole === "driver"
        ? vehicleColor || null
        : null,

    createdAt: new Date(),
  };

  users[selectedRole].push(user);

  return user;
};

const createRideRequest = async (riderId, data) => {
  const rideRequest = {
    _id: randomUUID(),

    rider: riderId,

    pickupLocation:
      data.pickupLocation || "",

    destination:
      data.destination || "",

    pickupCoordinates:
      data.pickupCoordinates || null,

    destinationCoordinates:
      data.destinationCoordinates || null,

    departureDate:
      data.departureDate || null,

    departureTime:
      data.departureTime || "",

    seatsRequired:
      Number(data.seatsRequired) || 1,

    notes:
      data.notes || "",

    status: "waiting",

    groupId: null,

    assignedDriver: null,

    trip: null,

    createdAt: new Date(),

    updatedAt: new Date(),
  };

  rideRequests.push(rideRequest);

  return rideRequest;
};

const getRideRequestsByRider = async (riderId) => {
  const requests = rideRequests
    .filter(
      (item) =>
        String(item.rider) === String(riderId)
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    );

  return Promise.all(
    requests.map(async (request) => {
      if (!request.assignedDriver) {
        return {
          ...request,
          assignedDriver: null,
        };
      }

      const driver =
        await findUserById(
          request.assignedDriver
        );

      if (!driver) {
        return {
          ...request,
          assignedDriver: null,
        };
      }

      return {
        ...request,

        assignedDriver: {
          _id: driver._id,

          name: driver.name,

          full_name:
            driver.full_name ||
            driver.name,

          email: driver.email,

          phone:
            driver.phone || null,

          vehicleType:
            driver.vehicleType || null,

          vehicleNumber:
            driver.vehicleNumber || null,

          vehicleModel:
            driver.vehicleModel || null,

          vehicleColor:
            driver.vehicleColor || null,
        },
      };
    })
  );
};

const getRideRequestById = async (id) => {
  const request =
    rideRequests.find(
      (item) =>
        String(item._id) === String(id)
    );

  if (!request) {
    return null;
  }

  if (!request.assignedDriver) {
    return {
      ...request,
      assignedDriver: null,
    };
  }

  const driver =
    await findUserById(
      request.assignedDriver
    );

  if (!driver) {
    return {
      ...request,
      assignedDriver: null,
    };
  }

  return {
    ...request,

    assignedDriver: {
      _id: driver._id,

      name: driver.name,

      full_name:
        driver.full_name ||
        driver.name,

      email: driver.email,

      phone:
        driver.phone || null,

      vehicleType:
        driver.vehicleType || null,

      vehicleNumber:
        driver.vehicleNumber || null,

      vehicleModel:
        driver.vehicleModel || null,

      vehicleColor:
        driver.vehicleColor || null,
    },
  };
};

const updateRideRequest = async (
  id,
  data
) => {
  const index =
    rideRequests.findIndex(
      (item) =>
        String(item._id) === String(id)
    );

  if (index === -1) {
    return null;
  }

  rideRequests[index] = {
    ...rideRequests[index],

    ...data,

    updatedAt: new Date(),
  };

  return getRideRequestById(id);
};

const cancelRideRequest = async (id) => {
  return updateRideRequest(id, {
    status: "cancelled",
  });
};

const deleteRideRequest = async (id) => {
  const index =
    rideRequests.findIndex(
      (item) =>
        String(item._id) === String(id)
    );

  if (index === -1) {
    return null;
  }

  const [removed] =
    rideRequests.splice(index, 1);

  return removed;
};

const searchRideRequests = async ({
  pickupLocation,
  destination,
  departureDate,
}) => {
  return rideRequests.filter(
    (item) => {
      const matchesStatus =
        item.status === "waiting" ||
        item.status === "ready" ||
        item.status === "grouped";

      const matchesPickup =
        !pickupLocation ||
        String(
          item.pickupLocation || ""
        )
          .toLowerCase()
          .includes(
            String(
              pickupLocation
            ).toLowerCase()
          );

      const matchesDestination =
        !destination ||
        String(
          item.destination || ""
        )
          .toLowerCase()
          .includes(
            String(
              destination
            ).toLowerCase()
          );

      const matchesDate =
        !departureDate ||
        String(
          item.departureDate
        ) === String(departureDate);

      return (
        matchesStatus &&
        matchesPickup &&
        matchesDestination &&
        matchesDate
      );
    }
  );
};

const assignDriver = async (
  rideRequestId,
  driverId,
  tripId = null
) => {
  const rideRequest =
    rideRequests.find(
      (item) =>
        String(item._id) ===
        String(rideRequestId)
    );

  if (!rideRequest) {
    return null;
  }

  rideRequest.assignedDriver =
    driverId;

  rideRequest.trip =
    tripId || null;

  rideRequest.status =
    "accepted";

  rideRequest.updatedAt =
    new Date();

  return getRideRequestById(
    rideRequestId
  );
};

module.exports = {
  enable,
  isEnabled,

  findUserByEmail,
  findUserById,

  createUser,

  createRideRequest,

  getRideRequestsByRider,

  getRideRequestById,

  updateRideRequest,

  cancelRideRequest,

  deleteRideRequest,

  searchRideRequests,

  assignDriver,
};