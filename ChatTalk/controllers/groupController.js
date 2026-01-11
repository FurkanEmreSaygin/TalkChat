const groupService = require("../services/groupService");

exports.getMyGroups = async (req, res) => {
  try {
    const userId = req.user.userId;
    const groups = await groupService.getUserGroups(userId);
    res.status(200).json({ groups });
  } catch (error) {
    console.error("Get Groups Error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.createGroup = async (req, res) => {
  try {
    const currentUserId = req.user.userId; 
    const newGroup = await groupService.createGroup(req.body, currentUserId);

    res.status(201).json({
      success: true,
      message: "Grup başarıyla oluşturuldu",
      group: newGroup,
    });
  } catch (error) {
    console.error("Create Group Error:", error);
    res.status(400).json({ error: error.message });
  }
};
