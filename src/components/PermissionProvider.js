import React, { createContext, useContext, useEffect, useState } from "react";
import { API } from "../FirebaseConfig";

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]);
  const username = localStorage.getItem("empid");

const fetchPermissions = async () => {
  try {
    const response = await API.get(`/employees/${username}`);
    const data = response.data;

    // find all permission groups
    const permissionGroups = Object.keys(data).filter((k) =>
      k.endsWith("permission")
    );

    let userPermissions = [];

    permissionGroups.forEach((group) => {
      const permissions = data[group];
      Object.entries(permissions).forEach(([key, value]) => {
        if (typeof value === "boolean" && value === true) {
          userPermissions.push(key);
        }
      });
    });

    // ✅ remove duplicates correctly
    const uniquePermissions = [...new Set(userPermissions)];

    setPermissions(uniquePermissions);
  } catch (error) {
    console.error("Error fetching permissions:", error);
  }
};


  useEffect(() => {
    fetchPermissions();
  }, [username]);

  const hasPermission = (permission) => permissions.includes(permission);

  return (
    <PermissionContext.Provider
      value={{ permissions, setPermissions, hasPermission }}
    >
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => useContext(PermissionContext);
