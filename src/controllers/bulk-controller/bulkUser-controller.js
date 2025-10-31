import XLSX from 'xlsx';
import multer from 'multer';
import User from '../../models/user-panel/user.js';
import Plan from '../../models/admin-panel/Plan.js';
import Payment from '../../models/payment-model/Payment.js';
import { calculateEndDate } from '../../utils/dateCalculator.js';

const upload = multer({ storage: multer.memoryStorage() });

export const bulkRegisterUsers = [
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);

      const insertedUsers = [];
      const failedUsers = [];

      for (const [index, row] of rows.entries()) {
        try {
          const {
            Name,
            Email,
            'Mobile No': mobileNo,
            Address,
            'Other No': otherNo,
            'Preferred Time': preferredTime,
            'Plan ID': planId,
            'Start Date': startDateRaw,
            Password,
            'Library ID': libraryId,
            'Seat No': seatNo,
            'Payment Mode': paymentMode,
            'Amount Paid': amountPaid,
            'Remaining Due': remainingDue,
          } = row;

          const startDate = new Date(startDateRaw);

          if (!mobileNo || !planId || !libraryId) {
            failedUsers.push({ index, error: 'Missing required fields (mobileNo, planId, or libraryId)' });
            continue;
          }

          const exists = await User.findOne({ mobileNo });
          if (exists) {
            failedUsers.push({ index, mobileNo, error: 'User already exists' });
            continue;
          }

          const plan = await Plan.findById(planId);
          if (!plan) {
            failedUsers.push({ index, planId, error: 'Plan not found' });
            continue;
          }

          const planValidity = calculateEndDate(startDate, plan.durationInDays);

          // Create new user
          const newUser = new User({
            name: Name,
            email: Email,
            mobileNo,
            address: Address,
            otherNo,
            password: Password || '123',
            mainPassword: Password || '123',
            preferredTime,
            role: 'user',
            subscriptions: [
              {
                libraryId,
                planId,
                seatNo,
                startDate,
                endDate: planValidity.planEnd,
                totalDue: remainingDue || 0,
                status: planValidity.planActive,
              },
            ],
          });

          await newUser.save();

          // Create payment record
          const payment = new Payment({
            userId: newUser._id,
            planId,
            libraryId,
            amountPaid: amountPaid || 0,
            paymentMode: paymentMode || 'Cash',
            paymentStatus: true,
            remainingDue: remainingDue || 0,
            startDate,
            endDate: planValidity.planEnd,
          });

          await payment.save();

          // Add due payment reference if applicable
          if (remainingDue > 0) {
            await User.updateOne(
              { _id: newUser._id, 'subscriptions.libraryId': libraryId },
              {
                $push: {
                  'subscriptions.$.duePayments': {
                    paymentId: payment._id,
                    dueAmount: remainingDue,
                  },
                },
              }
            );
          }

          insertedUsers.push({
            index,
            user: newUser.name,
            mobileNo: newUser.mobileNo,
            paymentId: payment._id,
          });
        } catch (err) {
          failedUsers.push({ index, error: err.message });
        }
      }

      res.status(201).json({
        success: true,
        message: 'Bulk user registration completed',
        total: rows.length,
        inserted: insertedUsers.length,
        failed: failedUsers.length,
        failedUsers,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
];
