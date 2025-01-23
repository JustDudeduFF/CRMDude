import { onValue, ref } from "firebase/database";
import React, {createContext, useContext, useEffect, useState} from "react";
import { db } from "../FirebaseConfig";

const PermissionContext = createContext();

export const PermissionProvider = ({children}) => {
    const [permissions, setPermissions] = useState([]);
    const username = localStorage.getItem('contact');



    useEffect(() => {
        if (!username) return; // Avoid running the effect if `username` is not provided
    
        // Define permission references
        const permissionRefs = [
          { key: "customerpermission", ref: ref(db, `users/${username}/customerpermission`) },
          { key: "masterpermission", ref: ref(db, `users/${username}/masterpermission`) },
          { key: "leadpermission", ref: ref(db, `users/${username}/leadpermission`) },
          { key: "paymentpermission", ref: ref(db, `users/${username}/paymentpermission`) },
          { key: "networkpermission", ref: ref(db, `users/${username}/networkpermission`) },
          { key: "attendencepermission", ref: ref(db, `users/${username}/attendencepermission`) },
          { key: "payoutpermission", ref: ref(db, `users/${username}/payoutpermission`) },
          { key: "messagepermission", ref: ref(db, `users/${username}/messagepermission`) },
          { key: "inventorypermission", ref: ref(db, `users/${username}/inventorypermission`) },
          { key: "employeepermission", ref: ref(db, `users/${username}/employeepermission`) },
        ];
    
        const allPermissions = [];
    
        // Subscribe to each permission reference
        const unsubscribers = permissionRefs.map(({ key, ref }) => {
          return onValue(ref, (snapshot) => {
            const data = snapshot.val();
            if (data) {
              // Merge the permissions into the main array
              const permissionsFromData = Object.keys(data).filter((perm) => data[perm]);
              allPermissions.push(...permissionsFromData);
    
              // Remove duplicates and update stat  e
              setPermissions([...new Set(allPermissions)]);
            }
          });
        });
    
        // Cleanup listeners on unmount
        return () => {
          unsubscribers.forEach((unsubscribe) => unsubscribe());
        };
      }, [username]);

    const hasPermission = (permission) => permissions.includes(permission);

    return(
        <PermissionContext.Provider value={{permissions, setPermissions, hasPermission}}>
            {children}
        </PermissionContext.Provider>
    )
};

export const usePermissions = () => useContext(PermissionContext);