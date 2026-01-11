const groupRepository = require("../repositories/groupRepository");

class GroupService {
  async getUserGroups(userId) {
    return groupRepository.findGroupsByUserId(userId);
  }

  async createGroup(groupData, adminId) {
    const { name, profilePic, members, publicGroupKey } = groupData;

    const newGroup = await groupRepository.createGroup({
      name,
      profilePic: profilePic || "",
      members,
      admin: adminId, 
      publicGroupKey,
    });
    return newGroup;
  }
}
module.exports = new GroupService();
