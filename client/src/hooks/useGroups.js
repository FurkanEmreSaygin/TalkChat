import { useState, useEffect, useCallback, useContext } from "react";
import groupService from "../services/groupService";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

export const useGroups = () => {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useContext(AuthContext);

  const loadGroups = useCallback(async () => {
    try {
      const data = await groupService.getMyGroups();
      setGroups(data.groups || []);
    } catch (error) {
      console.error("Grup yükleme hatası:", error);
    }
  }, []);

  const createGroup = async (groupName, selectedFriends) => {
    setIsLoading(true);
    try {
      await groupService.createGroup(groupName, selectedFriends, user);
      toast.success("Grup oluşturuldu! 🎉");
      loadGroups();
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Grup oluşturulamadı.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  return { groups, createGroup, isLoading, loadGroups };
};
