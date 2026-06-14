import Notification from "../models/notification.model.js";

const notificationResolver = {
  Query: {
    notifications: async (_, { limit = 30 }, context) => {
      const user = await context.getUser();
      if (!user) throw new Error("Unauthorized");

      const safeLimit = Math.min(Math.max(Number(limit) || 30, 1), 100);
      return Notification.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .limit(safeLimit);
    },

    unreadNotificationCount: async (_, __, context) => {
      const user = await context.getUser();
      if (!user) throw new Error("Unauthorized");
      return Notification.countDocuments({ userId: user._id, read: false });
    },
  },

  Mutation: {
    markNotificationRead: async (_, { notificationId }, context) => {
      const user = await context.getUser();
      if (!user) throw new Error("Unauthorized");

      const notification = await Notification.findById(notificationId);
      if (!notification) throw new Error("Notification not found");
      if (notification.userId.toString() !== user._id.toString()) {
        throw new Error("Unauthorized");
      }

      notification.read = true;
      await notification.save();
      return notification;
    },

    markAllNotificationsRead: async (_, __, context) => {
      const user = await context.getUser();
      if (!user) throw new Error("Unauthorized");

      await Notification.updateMany(
        { userId: user._id, read: false },
        { $set: { read: true } }
      );
      return { message: "All notifications marked as read." };
    },
  },
};

export default notificationResolver;
