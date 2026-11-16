import { expect } from '@playwright/test';
import { loginOrRegister } from './auth.js';
import PlanCreateFormComponent from '../components/form/PlanCreateForm.component.js';
import pause from '../utils/pause.js';

function makePlan(overrides) {
    const base = { name: `Plan ${Date.now()}`, description: '' };
    return overrides ? { ...base, ...overrides } : base;
}

export async function createPlan(page, plan) {
    const p = plan || makePlan();
    await page.getByRole('button', { name: /New Plan|Create your first plan/ }).first().click();
    await pause(500);
    const form = PlanCreateFormComponent(page);
    await form.fillAndSubmit(p);
    await expect(page.getByText(p.name).first()).toBeVisible({ timeout: 5000 });
    return p.name;
}

export async function enterPlan(page, planName) {
    await page.getByText(planName).first().click();
    await expect(page.getByText(planName).first()).toBeVisible({ timeout: 5000 });
    await pause(500);
}

export async function navigateToSection(page, section) {
    await page.getByRole('button', { name: section, exact: true }).or(page.getByRole('tab', { name: section, exact: true })).click();
    await pause(500);
}

export async function loginAndCreatePlan(page, plan) {
    const p = plan || makePlan();
    await loginOrRegister(page);
    const name = await createPlan(page, p);
    await enterPlan(page, name);
    return name;
}
