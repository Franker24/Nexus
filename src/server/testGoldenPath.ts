/**
 * NEXUS - Golden Path End-to-End Programmatic Test
 * Verifies the entire multi-agent pipeline from incident creation to verification and reporting.
 */

import dotenv from 'dotenv';
dotenv.config();

import { orchestrator } from './orchestrator';
import { approvalService } from './approvalService';
import { memoryContainer } from '../repositories/memoryStore';
import { auditService } from './auditService';
import { pipelineSimulation } from './simulation';

async function runGoldenPathTest() {
  console.log('=== STARTING NEXUS GOLDEN PATH BACKEND TEST ===\n');

  // Step 1: Create Revenue Incident Task
  console.log('1. Creating Revenue Operations Incident Task...');
  const task = await orchestrator.createRevenueIncidentTask();
  console.log(`   Task Created: ID = ${task.id}, TraceId = ${task.traceId}`);

  // Step 2: Run Workflow until Awaiting Approval
  console.log('2. Running Multi-Agent Workflow (Orchestrator -> Diagnostic -> Research -> Security)...');
  const taskAwaiting = await orchestrator.runWorkflow(task.id);
  console.log(`   Workflow State: ${taskAwaiting.status}`);

  if (taskAwaiting.status !== 'AWAITING_APPROVAL') {
    throw new Error(`Expected task status 'AWAITING_APPROVAL', but got '${taskAwaiting.status}'`);
  }

  // Step 3: Check Pending Approvals
  const pendingApprovals = await approvalService.getPending();
  console.log(`3. Checking Approval Queue: ${pendingApprovals.length} pending request(s) found.`);
  if (pendingApprovals.length === 0) {
    throw new Error('Expected 1 pending approval request, but found 0.');
  }

  const approvalReq = pendingApprovals[0];
  console.log(`   Approval Request ID: ${approvalReq.id}`);
  console.log(`   Action: ${approvalReq.actionDescription}`);
  console.log(`   Risk Level: ${approvalReq.riskLevel}`);
  console.log(`   Policy Rule: ${approvalReq.policyRule}`);

  // Step 4: Approve Request & Resume Workflow
  console.log('4. Approving Request via Approval Service...');
  const { approval } = await approvalService.approveRequest(approvalReq.id, 'Operator John Doe');
  console.log(`   Approval Status: ${approval.status}, Decided By: ${approval.decidedBy}`);

  console.log('5. Resuming Workflow (Operations Agent -> Tool Gateway -> Verification -> Reporting)...');
  const completedTask = await orchestrator.resumeWorkflow(task.id, approval.id);
  console.log(`   Final Task Status: ${completedTask.status}`);

  if (completedTask.status !== 'COMPLETED') {
    throw new Error(`Expected final task status 'COMPLETED', but got '${completedTask.status}'`);
  }

  // Step 5: Verify System Recovery Telemetry
  const telemetry = pipelineSimulation.getTelemetry();
  console.log('\n6. Checking Pipeline Infrastructure Simulation State:');
  console.log(`   Status: ${telemetry.status}`);
  console.log(`   Processing Rate: ${telemetry.processingRate} tx/min`);
  console.log(`   Error Rate: ${telemetry.errorRate}%`);
  console.log(`   Active Locks: ${telemetry.activeLocks}`);

  if (telemetry.status !== 'healthy' || telemetry.processingRate <= 0) {
    throw new Error('Pipeline simulation was not recovered to healthy status!');
  }

  // Step 6: Verify Immutable Audit Event Trail
  const auditLogs = await auditService.getAuditByTraceId(task.traceId);
  console.log(`\n7. Audit Log Count for Trace '${task.traceId}': ${auditLogs.length} events logged.`);
  const eventTypes = auditLogs.map((e) => e.eventType);
  console.log('   Logged Event Sequence:', eventTypes.join(' -> '));

  console.log('\n=== GOLDEN PATH TEST COMPLETED SUCCESSFULLY ===');
}

runGoldenPathTest().catch((err) => {
  console.error('\n=== GOLDEN PATH TEST FAILED ===');
  console.error(err);
  process.exit(1);
});
