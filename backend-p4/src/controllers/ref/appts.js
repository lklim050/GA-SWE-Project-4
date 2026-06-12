import Appts from "../models/Appts.js";
import Auth from "../models/Auth.js";

export const seedAppts = async (req, res) => {
  try {
    await Appts.deleteMany({});
    const seed = await Appts.create([
      {
        _id: "6a0b0f79e03e3f8a0c7caea6",
        title: "Dental, 10 Jun 2pm",
        type: "dental",
        purpose: "For scaling and cleaning services",
        person: "Dr Lau Ya",
        address: "Lau Ya Dentistry, Ang Mo Kio Ave 1",
        comment: "once every 6 months dental appointment",
        date: "2026-06-09T16:00:00.000+00:00",
        time: "14:00",
      },
      {
        _id: "6a0b0f79e03e3f8a0c7caea7",
        title: "Meeting, 11 Jun 3pm",
        type: "meeting",
        purpose: "discussion with lawyer",
        person: "Mr Li Hai",
        address: "Li Hai Law Firm, Bishan Ave 2",
        comment: "seeking for law advices regarding divorce cases",
        date: "2026-06-10T16:00:00.000+00:00",
        time: "15:00",
      },
      {
        _id: "6a0b0f79e03e3f8a0c7caea8",
        title: "Gym, 12 Jun 7pm",
        type: "gym",
        purpose: "leg day",
        person: "self",
        address: "NoTime Fitness Centre, Choa Chu Kang Ave 3",
        comment: "weekly gym sessons to keep fit",
        date: "2026-06-11T16:00:00.000+00:00",
        time: "19:00",
      },
      {
        _id: "6a0b0f79e03e3f8a0c7caea9",
        title: "Grocery at 13 Jun 10am",
        type: "grocery",
        purpose: "weekly grocery purchases",
        person: "self",
        address: "Dover Supermarket, Dover Ave 4",
        comment:
          "to replenish food stocks, rmb to buy more eggs and milk, this week also got sale, rmb NTUC card",
        date: "2026-06-12T16:00:00.000+00:00",
        time: "10:00",
      },
    ]);
    res.json({
      status: "ok",
      msg: "seeding success",
      count: `${seed.length} entries created`,
    });
  } catch (error) {
    console.error(error.message);
    res.status(404).json({ status: "error", msg: "fail to seed data" });
  }
};

export const createAppt = async (req, res) => {
  try {
    console.log("params:", req.params, "body:", req.body);
    const user = await Auth.findById(req.params.userId);
    if (!user) return res.status(404).json({ msg: "user not found" });
    const appt = {
      title: req.body.title,
      type: req.body.type,
      purpose: req.body.purpose || "",
      company: req.body.company || "",
      person: req.body.person || "",
      address: req.body.address || "",
      comment: req.body.comment || "",
      date: req.body.date,
      time: req.body.time,
    };
    user.appts.push(appt);
    await user.save();
    res.json({
      status: "ok",
      msg: "appt created successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ status: "error", msg: "fail to create Appt" });
  }
};

export const readAllAppts = async (req, res) => {
  try {
    const user = await Auth.findById(req.params.userId);
    if (!user) return res.status(404).json({ msg: "user not found" });
    res.json({
      status: "fetch successfully",
      user: user.username,
      appointments: user.appts,
    });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ status: "error", msg: "fail to create Appt" });
  }
};

export const updateAppt = async (req, res) => {
  try {
    const user = await Auth.findById(req.params.userId);
    if (!user) return res.status(404).json({ msg: "user not found" });
    const updated = user.appts.id(req.params.apptId);
    if (!updated) return res.status(404).json({ msg: "entry not found" });
    if ("title" in req.body) updated.title = req.body.title;
    if ("type" in req.body) updated.type = req.body.type;
    if ("purpose" in req.body) updated.purpose = req.body.purpose;
    if ("company" in req.body) updated.company = req.body.company;
    if ("person" in req.body) updated.person = req.body.person;
    if ("address" in req.body) updated.address = req.body.address;
    if ("comment" in req.body) updated.comment = req.body.comment;
    if ("date" in req.body) updated.date = req.body.date;
    if ("time" in req.body) updated.time = req.body.time;
    await user.save();
    res.json({
      status: "ok",
      message: "update successfully",
      content: updated,
    });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ status: "error", msg: "fail to create Appt" });
  }
};

export const deleteAppt = async (req, res) => {
  try {
    const user = await Auth.findById(req.params.userId);
    if (!user) return res.status(404).json({ msg: "user not found" });
    user.appts.pull(req.params.apptId);
    await user.save();
    res.json({ status: "ok", msg: "entry deleted", content: user.appts });
  } catch (error) {
    console.error(error.message);
    res.status(404).json({ status: "error", msg: "fail to delete" });
  }
};

export const postAppt = async (req, res) => {
  try {
    const user = await Auth.findById(req.params.userId);
    if (!user) return res.status(404).json({ msg: "user not found" });
    const appt = await Auth.appts.findById(req.params.apptId);
    if (!appt)
      return res
        .status(404)
        .json({ status: "error", msg: "id does not exist" });
    res.json({
      status: "ok",
      msg: "entry found",
      show: {
        title: appt.title,
        type: appt.type,
        purpose: appt.purpose,
        company: appt.company,
        person: appt.person,
        address: appt.address,
        comment: appt.comment,
        date: appt.date,
        time: appt.time,
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(404).json({ status: "error", msg: "fail to find" });
  }
};
