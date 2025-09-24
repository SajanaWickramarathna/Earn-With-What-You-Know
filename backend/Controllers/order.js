const Order = require("../Models/Order");
const Cart = require("../Models/CartModel");
const Course = require("../Models/courses");
const nodemailer = require("nodemailer");
const User = require("../Models/user");
const notification = require("../Models/notification");


// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "sajanaanupama123@gmail.com",
    pass: "melc veit raso vsqm",
  },
});

const sendEmail = (to, subject, text, html) => {
  const mailOptions = {
    from: "sajanaanupama123@gmail.com",
    to,
    subject,
    text,
    html,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) console.error("❌ Email error:", error);
    else console.log("📧 Email sent:", info.response);
  });
};

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { user_id, email, payment_method, total_price } = req.body;

    if (!user_id || !email || !payment_method) 
      return res.status(400).json({ message: "Missing required fields" });
    
    if (!["Payment Slip"].includes(payment_method))
      return res.status(400).json({ message: "Invalid payment method" });

    if (payment_method === "Payment Slip" && !req.file)
      return res.status(400).json({ message: "Payment slip is required" });
    
    // Fetch cart
    const cart = await Cart.findOne({ user_id: Number(user_id) });
    if (!cart || cart.items.length)
      return res.status(400).json({ message: "Cart is empty" });

    const user = await User.findOne({ user_id: Number(user_id) });

    const newOrder = new Order({
      user_id: Number(user_id),
      items: cart.items.map((item) => ({
        course_id: Number(item.course_id),
        price: item.price,
      })),
      total_price,
      payment_method,
      status: "pending",
      payment_status: payment_method === "Payment Slip" ? "pending" : "paid",
      payment_method,
      payment_slip: req.file ? req.file.filename : null,
    });
    await newOrder.save();
    await Cart.findOneAndDelete({ user_id: Number(user_id) });

    const courseDetailsText = newOrder.items.map((c) => `Course ID: ${c.course_id}, Price: $${c.price}`).join("\n");
    const courseDetailsHTML = newOrder.items.map((c) => `<li>Course ID: ${c.course_id}, Price: $${c.price}</li>`).join("");

    // Send email to user
    sendEmail(
      email,
      "Order Confirmation",
      `Thank you for your order!\n\nOrder ID: ${newOrder.order_id}\n\nCourses:\n${courseDetailsText}\n\nTotal Price: $${newOrder.total_price}\n\nPayment Method: ${newOrder.payment_method}\n\nWe will notify you once your payment is confirmed.`,
      `<p>Thank you for your order!</p><p><strong>Order ID:</strong> ${newOrder.order_id}</p><p><strong>Courses:</strong></p><ul>${courseDetailsHTML}</ul><p><strong>Total Price:</strong> $${newOrder.total_price}</p><p><strong>Payment Method:</strong> ${newOrder.payment_method}</p><p>We will notify you once your payment is confirmed.</p>`
    );
    // admin email
    sendEmail(
      "sajanaanupama123@gmail.com",
      "New Order Placed",
      `A new order has been placed.\n\nOrder ID: ${newOrder.order_id}\nUser ID: ${newOrder.user_id}\n\nCourses:\n${courseDetailsText}\n\nTotal Price: $${newOrder.total_price}\n\nPayment Method: ${newOrder.payment_method}`,
      `<p>A new order has been placed.</p><p><strong>Order ID:</strong> ${newOrder.order_id}</p><p><strong>User ID:</strong> ${newOrder.user_id}</p><p><strong>Courses:</strong></p><ul>${courseDetailsHTML}</ul><p><strong>Total Price:</strong> $${newOrder.total_price}</p><p><strong>Payment Method:</strong> ${newOrder.payment_method}</p>`
    );

    // Create in-app notification for user
    await notification.create({
      user_id: Number(user_id),
      message: `Your order #${newOrder.order_id} has been placed successfully.`,
    });

    // Create in-app notification for admin
    const admin = await User.findOne({ role: "admin" });
    const adminNotification = admins.map(admin => ({
      user_id: admin.user_id,
      message: `A new order #${newOrder.order_id} has been placed by User ID ${newOrder.user_id}.`,
    }));
    await notification.insertMany(adminNotification);

    return res.status(201).json({ message: "Order created successfully", order: newOrder });
  } catch (err) {
    console.error("❌ Create order error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


// Get orders for logged-in learner
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.params;
    const orders = await Order.find({ user_id: Number(userId) }).sort({ created_at: -1 }); 
    return res.status(200).json(orders);
  } catch (err) {
    console.error("❌ Get orders error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get all orders (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ created_at: -1 });
    const users = User.find();

    const ordersWithUser = orders.map((order) => {
      const user = users.find(u => u.user_id === order.user_id);
      return {
        ...order._doc,
        user_name: user ?  `${user.firstname} ${user.lastname}` : "Unknown User",
      };
    });

    res.status(200).json(ordersWithUser);
  } catch (err) {
    console.error("❌ Get all orders error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update order status (admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const updatedOrder = await Order.findOneAndUpdate(
      { order_id: Number(order_id) },
      { status },
      { new: true }
    );

    if (!updatedOrder)
      return res.status(404).json({ message: "Order not found" });

    const user = await User.findOne({ user_id: updatedOrder.user_id });
    if (!user) return res.status(404).json({ message: "User not found" });

    // 🔔 Notification
    await Notification.create({
      user_id: Number(updatedOrder.user_id),
      message: `Order ${updatedOrder.order_id} status updated to ${status}`,
    });

    // 📧 send email
    sendEmail(
      user.email,
      "Order Status Updated",
      `Your order #${updatedOrder.order_id} status has been updated to ${status}.`,
      `<p>Your order #${updatedOrder.order_id} status has been updated to <strong>${status}</strong>.</p>`
    );
    res.status(200).json({ message: "Order status updated", order: updatedOrder });
  } catch (err) {
    console.error("❌ Update order status error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// GET ORDER BY ID - new
exports.getOrderById = async (req, res) => {
  try {
    const { order_id } = req.params;
    const order = await Order.findOne({ order_id: Number(order_id) });
    if (!order) return res.status(404).json({ message: "Order not found" });
    // const productDetails = await Promise.all(
    //   order.items.map(async (item) => {
    //     const product = await Product.findOne({ product_id: item.product_id });
    //     return {
    //       ...item,
    //       product_name: product ? product.product_name : "Unknown",
    //       product_price: product ? product.product_price : 0,
    //     };
    //   })
    // );
    res.status(200).json(order);
  } catch (error) {
    console.error("❌ getOrderById Error:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

