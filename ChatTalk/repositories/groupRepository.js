const Group = require("../models/Groups");

class GroupsRepository {
  async findGroupsByUserId(userId) {
    return await Group.find({ "members.user": userId }).populate("members.user", "userName profilePic").populate("lastMessage");
  }

  async createGroup(groupData) {
    const newGroup = new Group(groupData);
    return await newGroup.save();
  }
}

module.exports = new GroupsRepository();
