import { onValue, ref } from "firebase/database";
import React, { createContext, useContext, useEffect, useState } from "react";
import { api2, db } from "../FirebaseConfig";
import axios from "axios";
import { set } from "date-fns";

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]);
  const username = localStorage.getItem("empid");

const fetchPermissions = async () => {
  try {
    const response = await axios.get(`${api2}/employees/${username}`);
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
