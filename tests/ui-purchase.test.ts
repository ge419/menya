import { test, expect } from "@playwright/test";

test("test clicking first product", async ({ page }) => {
  page.on("dialog", async (dialog) => {
    await dialog.dismiss();
  });

  await page.goto(
    "http://localhost:31002/api/login?key=alpha-beta-delta&user=test.user&preferred_username=test.user&email=testuser@duke.edu"
  );

  await page.waitForResponse(
    (response) =>
      response.url().includes("api/all-products") && response.status() === 200
  );
  await page.waitForSelector('[data-testid="product-item4"]');

  await page.click('[data-testid="product-item0"]');

  await expect(page).toHaveURL(/\/product\/\d+/);

  await page.getByRole("button", { name: "Add to Cart" }).click();

  await page.waitForSelector('[data-testid="my-cart-nav"]');

  await page.click('[data-testid="my-cart-nav"]');

  await expect(page).toHaveURL(/\/shopping-cart/);

  await page.getByRole("button", { name: "Edit Details" }).click();

  await page.waitForSelector("#nameInput");

  await page.fill("#nameInput", "John Doe");

  await page.fill("#telephoneInput", "1234567890");

  await page.fill("#addressInput", "407 Towerview Rd, Durham, NC");

  await page.click('button[type="submit"]');

  await page.getByRole("button", { name: "Confirm Cart" }).click();

  await page.getByRole("button", { name: "Pay" }).click();

  await page.waitForSelector('[data-testid="my-profile-nav"]');

  await page.click('[data-testid="my-profile-nav"]');

  await expect(page).toHaveURL(/\/profile/);

  await page.waitForSelector(".order-block");

  await page.waitForSelector(".order-block:last-child", { state: "visible" });

  const lastProductName = await page
    .locator('.order-block:last-child [data-testid^="product-name-"]')
    .textContent();

  await expect(lastProductName).toContain("Shin Ramen");
});
