import { ApplicationInfoRow, ServerInfoRow, User, UserAppsRow } from "./api-types";
import { faker } from "@faker-js/faker";

export const getUserByUid = (uid: number) => mockUsers.find(u => u.user_uid === uid);
export const getNextId = <T>(db: Array<T>, sortKey: keyof T): number => {
    if (db.length === 0) {
        return 0;
    }
    const sorted: Array<T> = [...db].sort((a, b) => { 
        if (a[sortKey] < b[sortKey]) return 1;
        if (a[sortKey] > b[sortKey]) return -1;
        return 0;
    });
    return Number(sorted[0][sortKey]) || 0;  
}
export const mockServerInfos: Array<ServerInfoRow> = Array.from({ length: 5 }, (_, i: number): ServerInfoRow => {
    const randomCreationDate: Date = faker.date.recent(); 
    return {
        server_info_uid: i + 1,
        app_info_uid: faker.number.int({ min: 1, max: 20 }),
        source_hostname: faker.internet.domainName(),
        source_ip_address: faker.internet.ipv4(),
        destination_hostname: faker.internet.domainName(),
        destination_ip_address: faker.internet.ipv4(),
        destination_port: String(faker.internet.port()),
        ip_status: "active",
        created_at: randomCreationDate.toDateString(),
        created_by: "mock_user",
        modified_at: randomCreationDate.toDateString(),
        modified_by: "mock_user"
    }
})
export const mockUsers: User[] = [
    { user_uid: 1, user_id: "mock_admin", user_role: "admin" },
    { user_uid: 2, user_id: "mock_user", user_role: "user" },
    ...Array.from({ length: 5 }, (_, i: number): User => {
        return {
            user_uid: 3+i,
            user_id: faker.internet.userName(),
            user_role: "user",
        }
    })
]
export const mockAppInfos: ApplicationInfoRow[] = [
    ...Array.from({ length: 20 }, (_, i: number): ApplicationInfoRow => {
        return {
            app_info_uid: i+1,
            app_info_description: faker.airline.airplane().iataTypeCode // random meaningless identifier code
        }
    })
]
export const mockUserApps: UserAppsRow[] = [
    // randomly distribute mock app infos across all users for testing
    ...Array.from({ length: mockAppInfos.length }, (_, i: number): UserAppsRow => {
        return {
            user_apps_uid: i+1,
            app_info_uid: i+1,
            user_uid: faker.number.int({ min: 1, max: mockUsers.length-1 }), 
        }
    })
]
