const Payment = require("../models/Payment");

const createPayment = async (req, res) => {
  try {
    const { bookingId, amount, paymentMethod, status } = req.body || {};

    if (!bookingId || !amount) {
      return res.status(400).json({
        message: "bookingId and amount are required",
      });
    }

    const receiptImage = req.file ? `/uploads/${req.file.filename}` : "";

    const payment = await Payment.create({
      bookingId,
      amount,
      paymentMethod: paymentMethod || "Cash",
      status: status || "Pending",
      receiptImage: receiptImage,
    });

    res.status(201).json({
      message: "Payment created successfully",
      payment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate({
      path: "bookingId",
      populate: [
        { path: "userId", select: "name email" },
        { path: "packageId", select: "title price" },
      ],
    });

    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate({
      path: "bookingId",
      populate: [
        { path: "userId", select: "name email" },
        { path: "packageId", select: "title price" },
      ],
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.status(200).json({
      message: "Payment updated successfully",
      payment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.status(200).json({
      message: "Payment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate({
      path: "bookingId",
      populate: [
        { path: "userId", select: "name email" },
        { path: "packageId", select: "title price" },
      ],
    });

    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePaymentStatus = async (req, res) => {
  try {
    const { status, referenceNumber } = req.body || {};

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const updateData = { status };
    if (referenceNumber) {
      updateData.referenceNumber = referenceNumber;
    }

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate({
      path: "bookingId",
      populate: [
        { path: "userId", select: "name email" },
        { path: "packageId", select: "title price" },
      ],
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.status(200).json({
      message: "Payment status updated successfully",
      payment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
  getAllPayments,
  updatePaymentStatus,
};