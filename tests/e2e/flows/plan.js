import { expect } from '@playwright/test';
import { loginOrRegister } from './auth.js';
import PlanCreateFormComponent from '../components/form/PlanCreateForm.component.js';
import pause from '../utils/pause.js';

const defaultPlan = { name: 'Test Plan', description: '' };

export async function createPlan(page, plan = defaultPlan) {
    await page.getByRole('button', { name: /New Plan|Create your first plan/ }).click();
    await pause(500);
    const form = PlanCreateFormComponent(page);
    await form.fillAndSubmit(plan);
    await expect(page.getByText(plan.name)).toBeVisible({ timeout: 5000 });
}

export async function enterPlan(page, planName = defaultPlan.name) {
    await page.getByText(planName).click();
    await expect(page.getByText(planName)).toBeVisible({ timeout: 5000 });
    await pause(500);
}

export async function navigateToSection(page, section) {
    await page.getByRole('button', { name: section }).or(page.getByRole('tab', { name: section })).click();
    await pause(500);
}

export async function loginAndCreatePlan(page, plan = defaultPlan) {
    await loginOrRegister(page);
    await createPlan(page, plan);
    await enterPlan(page, plan.name);
}
