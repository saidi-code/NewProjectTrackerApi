export const emitNotification = ({
  type,
  data,
  recipients,
}: {
  type: string;
  data: any;
  recipients: string[] | Types.ObjectId[];
}) => {
  recipients.forEach((recipientId) => {
    const room = `user-${recipientId.toString()}`;
    io.to(room).emit(type, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  });
};
