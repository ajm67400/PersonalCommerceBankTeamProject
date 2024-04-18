import { error, log } from "console";
import puppeteer, { Browser, Page, } from "puppeteer"
import { Role } from "./components/ip-whitelist-tracker-types";
import { faker } from '@faker-js/faker';
import { ServerInfoRow } from "./api/api-types";

// works in npm run dev only
const TEST_URL_ROOT = `http://localhost:5173`;

describe("[IP Whitelist Tracker]", () => {
  let browser: Browser;
  let page: Page;

  async function login(role: Role, customUsername?: string, customPassword?: string, failLogin?: boolean) {
    let username: string = customUsername === undefined ? "" : customUsername;
    const password: string = customPassword === undefined ? "commercebank" : customPassword;
    if (customUsername === undefined) {
      switch (role) {
        case "user": 
          username = "user";
          break;
        case "admin":
          username = "admin";
          break;
      }
    }
   
    expect(await page.$(".user-context")).toBeNull();
    log(failLogin ? "Failing a login attempt on purpose" : `Logging in as ${role}`)
    await page.goto(`${TEST_URL_ROOT}/login`);
    const inputs = await page.$$("[class*=chakra-input]");
    await inputs[0].type(username);
    await inputs[1].type(password)
    await page.click(`#root > div > div > form > div > div.chakra-form-control.login-submit-control.css-1kxonj9 > button`)
    if (failLogin) {
      expect(await page.$(".user-context")).toBeNull();
    }
  }

  async function logout() {
    log(`Logging out`)
    await page.goto(TEST_URL_ROOT);
    try {
      const logoutButton = await page.waitForSelector(".user-context > button", { timeout: 250 });
      if (logoutButton)
        await logoutButton.click();
    } catch (_) {
      error("No logout button to click")
    }
  }

  beforeAll(async () => {
    browser = await puppeteer.launch({headless: false});
    page = await browser.newPage();
  });

  beforeEach(async () => {
    await logout();
    log("\n", "\n", expect.getState().currentTestName, "\n", "-------------------------------------------")
  })

  afterAll(async () => {
    log("\n", "\n")
    setTimeout(async () => await browser.close(), 10000);
  });

  test("Application routes blocked for un-logged in users", async () => {
    const routes: Array<string> = [
      "/",
      "/user",
      "/user/ip-table",
      "/user/ip-table/1",
      "/user/ip-table/1/view",
      "/user/ip-table/1/edit",
      "/user/ip-table/1/add",
      "/admin",
      "/admin/application-info",
      "/admin/manage-users",
      "/admin/manage-users/1/view",
      "/admin/manage-users/1/apps/1/delete",
    ];

    for (const route of routes) {
      try {
        log(`Testing route ${route}`)
        await page.goto(`${TEST_URL_ROOT}${route}`);
        const loginElement = await page.waitForSelector(".login-page", { timeout: 5000 })
        expect(loginElement).not.toBeNull();
      } catch (err) {
        error(`Error testing ${route}:`, err);
      }
    }
  })

  test("IP Table Allows Users Only", async () => {
    // now login as admin and sure IP table card doesn't show up
    await login("admin");
    await page.waitForSelector(".title-area", {timeout: 5000})
    const serverInfoCard = await page.$$(`.title-area > h2`);
    for (const element of serverInfoCard) {
      const text = await element.evaluate(e => e.textContent);
      log(`Card text is "${text}"`)
      expect(text).not.toBe("Server Info"); 
    }

    const userRoutes: Array<string> = [
      "/user",
      "/user/ip-table",
      "/user/ip-table/1",
      "/user/ip-table/1/view",
      "/user/ip-table/1/edit",
      "/user/ip-table/1/add",
      "/user/ip-table/1/delete",
    ];

    // go to page directly make sure it blocks admin user
    for (const route of userRoutes) {
      log(`Testing if admin forbidden from ${route}`)
      await page.goto(`${TEST_URL_ROOT}${route}`)
      await page.waitForSelector(".page-not-found", {timeout: 5000})
      const pageNotFound = await page.$(".page-not-found > h1");
      expect(pageNotFound).not.toBeNull();
      if (pageNotFound) {
        const text = await pageNotFound.evaluate(e => e.textContent);
        expect(text).toBe("Forbidden");
      }
    }

    // login as user and verify we can now access user routes
    await logout()
    await login("user")
    for (const route of userRoutes) {
      log(`Testing user can access ${route}`)
      await page.goto(`${TEST_URL_ROOT}${route}`)
      await page.waitForSelector(".page-not-found", {timeout: 5000})
      const pageNotFound = await page.$(".page-not-found > h1");
      expect(pageNotFound).toBeNull();
      if (pageNotFound) {
        const text = await pageNotFound.evaluate(e => e.textContent);
        expect(text).not.toBe("Forbidden");
      }
    }
  });

  test("Admin Tables Allow Admin Only", async () => {
    await login("user");
    await page.waitForSelector(".title-area", {timeout: 5000})
    const serverInfoCard = await page.$$(`.title-area > h2`);
    for (const element of serverInfoCard) {
      const text = await element.evaluate(e => e.textContent);
      log(`Card text is "${text}"`)
      expect(text).not.toContain("Users"); 
      expect(text).not.toContain("Application Info")
    }

    const adminRoutes: Array<string> = [
      "/admin",
      "/admin/application-info",
      "/admin/manage-users",
      "/admin/manage-users/1/view",
      "/admin/manage-users/1/apps/1/delete",
    ]
    // verify user cannot access admin routes
    for (const route of adminRoutes) {
      log(`Testing if user forbidden from ${route}`)
      await page.goto(`${TEST_URL_ROOT}${route}`)
      await page.waitForSelector(".page-not-found", {timeout: 5000})
      const pageNotFound = await page.$(".page-not-found > h1");
      expect(pageNotFound).not.toBeNull();
      if (pageNotFound) {
        const text = await pageNotFound.evaluate(e => e.textContent);
        expect(text).toBe("Forbidden");
      }
    }

    // now login as admin and verify we can now access admin routes
    await logout();
    await login("admin")
    for (const route of adminRoutes) {
      log(`Testing if user forbidden from ${route}`)
      await page.goto(`${TEST_URL_ROOT}${route}`)
      await page.waitForSelector(".page-not-found", {timeout: 5000})
      const pageNotFound = await page.$(".page-not-found > h1");
      expect(pageNotFound).toBeNull();
      if (pageNotFound) {
        const text = await pageNotFound.evaluate(e => e.textContent);
        expect(text).not.toBe("Forbidden");
      }
    }
  })

  test("Login should not let you in on invalid details provided", async () => {
    await login("user", "", "", true);
    await login("user", "", "lksdjflkj", true);
    await login("user", "sokjdfhkg", "", true);
    await login("user", "lsdkfgfligh", "ldl dfls dflsld f9d9", true);
    await login("admin", "", "", true);
    await login("admin", "", "sdoi !\\ \\ \\ 1", true);
    await login("admin", "sssss", "", true);
    await login("admin", "sddsfsss", "kdfhgdfg", true);
  })

  test("IP Table Record Should Edit", async () => {
    await login("user");
    await page.goto(`${TEST_URL_ROOT}/user/ip-table`);
    const table = await page.waitForSelector(".commerce-table", {timeout: 5000});
    expect(table).not.toBeNull();
   
    // edit the first record in the table
    log(`Editing first row in IP table`)
    const rows = await table!.$$(".commerce-table-row")
    expect(rows.length).toBeGreaterThan(0); // TODO if testing real api, maybe add a test mock record first.

    const firstRowActions = await rows[0].$$(".row-action > button");
    expect(firstRowActions.length).toBe(3); // view, edit, delete
    
    const editButton = firstRowActions[1];
    await editButton.click();
    await page.waitForSelector(".ip-action-page", {timeout: 5000})
    const pageContext = await (await page.$(".top-context-row > h1"))?.evaluate(e => e.textContent);
    expect(pageContext).not.toBeNull();
    expect(pageContext).toContain("Edit Server ID");

    log(`At edit page`)
    // find the edit button for destination_ip_address
    const editCells = await page.$$(".edit-cell");
    expect(editCells).not.toBeNull();
    expect(editCells.length).toBe(12); // always size of server info record from project requirements

    // start editing it
    log(`Editing cell destination ip of first row`)
    const destinationIpAddrCell = editCells[5];
    const destinationIpAddrEditButton = await destinationIpAddrCell.$(`button[aria-label="Edit"]`)
    expect(destinationIpAddrEditButton).not.toBeNull();
    await destinationIpAddrEditButton!.click();

    // type new value into editor text input
    const editorInput = await destinationIpAddrCell.$("input");
    expect(editorInput).not.toBeNull();
    const randomIpAddress = faker.internet.ipv4();
    log(`Changing value to random ip: ${randomIpAddress}`)
    await editorInput!.type(randomIpAddress);
    await editorInput!.press("Enter");
    const newCellText = await destinationIpAddrCell.evaluate(e => e.textContent);
    expect(newCellText).toBe(randomIpAddress);

    // go back to table view
    await page.goBack();
    log(`Cell edited, going back to ip table...`)

    // check if the edit reflected properly
    const newTableRows = await page.$$(".commerce-table-row")
    expect(newTableRows.length).toBeGreaterThan(0);
    const editedTableRow = newTableRows[0];
    const editedCell = (await editedTableRow.$$("td"))[3];
    expect(editedCell).not.toBeNull();
    const editedCellText = await editedCell.evaluate(e => e.textContent);
    expect(editedCellText).toEqual(randomIpAddress);
    log(`Cell: ${editedCellText}, Expected: ${randomIpAddress}`)
  })

  test("IP Table Test Suite (Happy Paths)", async () => {
    await login("user");
    await page.goto(`${TEST_URL_ROOT}/user/ip-table`)
    await page.waitForSelector(".commerce-table"); 
    await page.waitForSelector(".commerce-table-row")

    const numberOfServerInfos = 10; 
    log(`Generating ${numberOfServerInfos} random server info records to insert...`)
    const testServerInfos = Array.from({ length: numberOfServerInfos }, (): Partial<ServerInfoRow> => ({
      app_info_uid: faker.number.int(), 
      source_hostname: faker.internet.domainName(), 
      source_ip_address: faker.internet.ipv4(), 
      destination_hostname: faker.internet.domainName(), 
      destination_ip_address: faker.internet.ipv4(), 
      destination_port: String(faker.internet.port()), 
    }));

    // add x amount of server infos to the table
    for (const server of testServerInfos) {
      const serverInfo = server as Partial<ServerInfoRow>;
      log(`Filling in server info: ${[...Object.values(serverInfo)]}`)
      
      // click add ip button
      const rowActions = await page.$$(".row-action-th");
      expect(rowActions).not.toBeNull();
      const addAction = await rowActions[2].$("button");
      expect(addAction).not.toBeNull();
      await addAction!.click();

      // we should be on add ip page
      const ipAddPage = await page.waitForSelector(".ip-add-modal", {timeout: 500});
      expect(ipAddPage).not.toBeNull();

      // get all inputs we are gonna fill in
      const addIpInputs = await page.$$(`input[type="text"]`)
      expect(addIpInputs).not.toBeNull();
      expect(addIpInputs.length).toEqual(Object.keys(serverInfo).length);

      // fill in the form
      for (let i = 0; i < addIpInputs.length; ++i) {
        const key = Object.keys(serverInfo)[i] as keyof ServerInfoRow;
        const value = serverInfo[key] as string;
        const input = addIpInputs[i];
        await input.type(String(value));
      }

      // click Add Record
      const addRecordButton = await page.$(`button[type="submit"]`)
      expect(addRecordButton).not.toBeNull();
      await addRecordButton!.click();

      // confirm we still aren't on the add page (success)
      expect(await page.$(".commerce-table")).not.toBeNull();

      // confirm row added to table
      log(`Confirming that the newly added row appears in table...`)
      await page.waitForSelector(".commerce-table");
      const rows = await page.$$(".commerce-table-row");
      expect(rows).not.toBeNull();
      expect(rows.length).toBeGreaterThan(0);   

      let rowIsPresent = false;
      for (const row of rows) {
        const tableDataElements = await row.$$('td');
        // Check if the table row matches the serverInfo object
        expect(tableDataElements.length).toEqual(8)
        // we check the random ip address, since that will nearly always be unique 
        const ipAddress = tableDataElements[3];
        const td = await ipAddress.evaluate(e => e.textContent);
        if (td === '')
        // not a cell with text
          continue;

        expect(td).not.toBeNull();
        const text = td!.trim();
        if (text !== serverInfo.destination_ip_address!.trim())
        // not our row we just added 
          continue;
        log(`Newly added row found in table. Added successfully (IP: ${text}, ServerInfo: ${[...Object.values(serverInfo)]})`)
        rowIsPresent = true;
      }
      expect(rowIsPresent).toEqual(true);

    }
    log(`All rows added successfully`)

    async function testAllColumnFilters() {
      // click columns filter button
      log(`Starting column filtering test`)
      if ((await page.$$(".column-filter-key")).length === 0) {
        const filterFunnelButton = await page.$(".filter-funnel");
        expect(filterFunnelButton).not.toBeNull(); 
        await filterFunnelButton!.click();
      }

      // sort on all columns
      const sortColumns = await page.$$(".column-filter-key");
      expect(sortColumns).not.toBeNull();
      expect(sortColumns.length).toBeGreaterThan(0)

      for (const sortCol of sortColumns) {
        log(`Testing filter column ${await sortCol.evaluate(e => e.textContent)}`) 
        for (let i = 0; i < 10; ++i)
          await sortCol.click(); 
        // TODO maybe a quick way to confirm if sorting worked?
      }
    }

    async function searchForRandomRecord() {
      const filterInput = await page.$(".commerce-table-search");
      expect(filterInput).not.toBeNull();

      // clear input
      await filterInput!.click();
      await page.keyboard.down('Control');
      await page.keyboard.press('A');
      await page.keyboard.up('Control');
      await page.keyboard.press('Backspace'); 
      expect((await filterInput?.evaluate(e => e.textContent))).toBe('');

      // choose one of the items we just added
      const serverToSearch: Partial<ServerInfoRow> = testServerInfos[Math.floor(Math.random()*testServerInfos.length)];
      // search for it
      await filterInput!.type(serverToSearch.destination_ip_address!);
      const resultRows = await page.$$(".commerce-table-row");
      // it should be the only item that appears, since we filtered on it
      expect(resultRows).not.toBeNull();
      expect(resultRows.length).toEqual(1); // unless you generate two of the same random ips. probably a one in a billion chance

      // clear input
      await filterInput!.click();
      await page.keyboard.down('Control');
      await page.keyboard.press('A');
      await page.keyboard.up('Control');
      await page.keyboard.press('Backspace'); 
      expect((await filterInput?.evaluate(e => e.textContent))).toBe('');
    }
  
    await testAllColumnFilters();

    // Finally, test search
    for (let i = 0; i < 20; ++i) {
      await searchForRandomRecord();
    }

    // search for nonsense
    await (await page.$(".commerce-table-search"))!.type("'kl;352l';;l345k;l34jk;ter;4")
    expect((await page.$$(".commerce-table-row")).length).toBe(0); 

    // do column filter test on empty result, make sure theres no edge case trouble
    await testAllColumnFilters();
  }, 60000)

  test("Admin Users Table Suite", async () => {
    await login("admin");
    await page.goto(TEST_URL_ROOT + "/admin/manage-users");

    log(`Finding first user row`)
    const userRow = await page.waitForSelector(".commerce-table-row");
    expect(userRow).not.toBeNull();

    log(`Going to user row's settings`)
    const userSettingsButton = await page.$(".row-action > button");
    expect(userSettingsButton).not.toBeNull();

    await userSettingsButton!.click();

    // there may not be any rows
    let appRow;
    let row = 1;
    while (!appRow) {
      log(`This user didn't have any app ids. Going to next user row. Oops`)
      appRow = await page.waitForSelector(".user-apps .commerce-table-row");
      if (!appRow) {
        await page.goto(`${TEST_URL_ROOT}/admin/manage-users/${++row}/view`)
      }
    }
    // get amount of apps BEFORE deleting
    const rowsBefore = await page.$$(".user-apps .commerce-table-row");
    expect(rowsBefore.length).toBeGreaterThan(0);
    const lengthBefore = rowsBefore.length;

    const appCell = await appRow.$("td");
    expect(appCell).not.toBeNull();

    const appWeAreDeleting = await appCell?.evaluate(e => e.textContent); 
    expect(appWeAreDeleting).not.toBe('');
    log(`Attempting to delete app "${appWeAreDeleting}" on user`)

    const deleteAppButton = await appRow.$(".user-apps .row-action > button");
    expect(deleteAppButton).not.toBeNull();
    await deleteAppButton!.click();
    log(`Delete attempted`)

    const pageContext = await page.$(".top-context-row > h1");
    expect(pageContext).not.toBeNull();
    const pageContextText = await pageContext!.evaluate(e => e.textContent);
    expect(pageContextText).toContain(appWeAreDeleting);

    const buttons = await page.$$(".choice-selection button")
    expect(buttons.length).toBe(2); // cancel and delete

    const deleteButton = buttons[1];
    const deleteButtonText = await deleteButton.evaluate(e => e.textContent);
    log(`"${deleteButtonText}"`)
    expect(deleteButtonText).toContain("Delete");
    await deleteButton.click();

    // deleted
    const tablePage = await page.waitForSelector(".admin-single-user-view");
    expect(tablePage).not.toBeNull();

    // check if row is gone
    const rows = await page.$$(".user-apps .commerce-table-row");
    expect(rows.length).toBe(lengthBefore - 1);
    log(`Was ${lengthBefore} before delete, now ${rows.length}`)
  }, 60000)
})

