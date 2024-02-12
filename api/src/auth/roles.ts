/**
 * Roles available in xmemo system
 * 
 * Options expand to a string, which is the string used in the database and on the frontend.
*/
export enum ROLES {
    USER = "user",
    MAINTAINER = "maintainer",
    ADMIN = "admin"
}

/**
 * Returns a Role from string
 * 
 * If the role does not exist it returns null
 */
export const RoleFromString = (role: string): ROLES | null => {
    const roles = Object.values(ROLES);
    if (roles.includes(role as ROLES)) {
        return role as ROLES;
    } else {
        return null
    }
}