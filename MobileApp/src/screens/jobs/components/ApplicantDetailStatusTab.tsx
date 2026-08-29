import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CheckCircle2, Circle, AlertCircle, ArrowRight, Lock, Check } from 'lucide-react-native';
import { ApplicationStatus, JobApplication } from '../../../types';
import { Badge } from '../../../components/common/Badge';
import { RADIUS } from '../../../constants/theme';

interface ApplicantDetailStatusTabProps {
  selectedApplicant: JobApplication | null;
  jobId?: string;
  onUpdateStatus: (userId: string, newStatus: ApplicationStatus, targetJobId?: string) => void;
  statusDates?: Record<string, string>;
}

const PIPELINE_STAGES: Array<{
  key: ApplicationStatus;
  label: string;
  desc: string;
  stepNumber: number;
}> = [
  {
    key: 'applied',
    label: 'Application Received',
    desc: 'Application submitted and placed in review queue',
    stepNumber: 1,
  },
  {
    key: 'shortlisted',
    label: 'Candidate Shortlisted',
    desc: 'Profile evaluated & shortlisted for technical interview',
    stepNumber: 2,
  },
  {
    key: 'interview',
    label: 'Interview Scheduled',
    desc: 'Interview schedule confirmed and interview pass dispatched',
    stepNumber: 3,
  },
  {
    key: 'hired',
    label: 'Hired / Offer Accepted',
    desc: 'Candidate successfully onboarded and accepted job position',
    stepNumber: 4,
  },
];

const formatStatusDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const ApplicantDetailStatusTab: React.FC<ApplicantDetailStatusTabProps> = ({
  selectedApplicant,
  jobId,
  onUpdateStatus,
  statusDates = {},
}) => {
  const currentStatus = (selectedApplicant?.status || 'applied').toLowerCase();
  const isRejected = currentStatus === 'rejected';

  // Normalize interview alias
  const normalizedStatus =
    currentStatus === 'interviewed' || currentStatus === 'interview_scheduled'
      ? 'interview'
      : currentStatus;

  const currentPipelineIdx = PIPELINE_STAGES.findIndex((s) => s.key === normalizedStatus);

  return (
    <View style={styles.container}>
      <View style={styles.sectionCard}>
        {/* 1. Header Overview Banner */}
        <View style={styles.headerOverviewRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionHeadingTitle}>CURRENT APPLICATION PIPELINE</Text>
            <View style={styles.currentBadgeRow}>
              <Badge status={selectedApplicant?.status || 'applied'} />
              <Text style={styles.activeStageMeta}>
                {isRejected
                  ? `Rejected on ${formatStatusDate(statusDates['rejected'] || (selectedApplicant as any)?.updated_at)}`
                  : `Stage ${currentPipelineIdx + 1} of 4`}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionDivider} />

        {/* 2. Sequential Pipeline Stepper Workflow */}
        <Text style={styles.sectionHeadingTitle}>APPLICATION STAGES WORKFLOW</Text>
        <Text style={styles.workflowHelperText}>
          Advance the candidate step-by-step. Previous milestones are locked once completed.
        </Text>

        <View style={styles.stepperContainer}>
          {PIPELINE_STAGES.map((stage, idx) => {
            const isCompleted = !isRejected && currentPipelineIdx > idx;
            const isCurrent = !isRejected && currentPipelineIdx === idx;
            const isUpcoming = !isRejected && currentPipelineIdx < idx;
            const isLastStep = idx === PIPELINE_STAGES.length - 1;

            const stageDate = statusDates[stage.key] || (isCompleted || isCurrent ? selectedApplicant?.applied_at : undefined);
            const formattedDate = formatStatusDate(stageDate);

            return (
              <View key={stage.key} style={styles.stepRowWrapper}>
                {/* Left Step Connector Line & Indicator Node */}
                <View style={styles.stepIndicatorCol}>
                  {!isLastStep ? (
                    <View
                      style={[
                        styles.stepConnectorLine,
                        isCompleted ? styles.stepConnectorLineDone : null,
                      ]}
                    />
                  ) : null}

                  {isCompleted ? (
                    <View style={styles.stepNodeDone}>
                      <Check size={12} color="#FFFFFF" strokeWidth={3} />
                    </View>
                  ) : isCurrent ? (
                    <View style={styles.stepNodeActive}>
                      <View style={styles.stepNodeActiveInner} />
                    </View>
                  ) : (
                    <View style={styles.stepNodeUpcoming}>
                      <Text style={styles.stepNodeUpcomingText}>{stage.stepNumber}</Text>
                    </View>
                  )}
                </View>

                {/* Right Stage Card Action Item */}
                <TouchableOpacity
                  activeOpacity={isUpcoming ? 0.75 : 1}
                  disabled={!isUpcoming}
                  style={[
                    styles.stageActionCard,
                    isCurrent && styles.stageActionCardCurrent,
                    isCompleted && styles.stageActionCardCompleted,
                    isUpcoming && styles.stageActionCardUpcoming,
                  ]}
                  onPress={() => {
                    if (isUpcoming && selectedApplicant) {
                      const activeJId = selectedApplicant.job_id || (selectedApplicant as any).jobId || jobId;
                      onUpdateStatus(selectedApplicant.user_id, stage.key, activeJId);
                    }
                  }}
                >
                  <View style={styles.stageCardHeaderRow}>
                    <View style={{ flex: 1, paddingRight: 6 }}>
                      <View style={styles.titleWithBadgeRow}>
                        <Text
                          style={[
                            styles.stageTitleText,
                            isCurrent && styles.stageTitleTextCurrent,
                            isCompleted && styles.stageTitleTextCompleted,
                          ]}
                        >
                          {stage.label}
                        </Text>
                        {isCurrent ? (
                          <View style={styles.activeTagBadge}>
                            <Text style={styles.activeTagBadgeText}>Active Stage</Text>
                          </View>
                        ) : isCompleted ? (
                          <View style={styles.completedTagBadge}>
                            <Text style={styles.completedTagBadgeText}>Completed</Text>
                          </View>
                        ) : null}
                      </View>

                      <Text style={styles.stageDescText}>{stage.desc}</Text>
                    </View>

                    {isUpcoming ? (
                      <View style={styles.promoteActionPill}>
                        <Text style={styles.promoteActionPillText}>Select</Text>
                        <ArrowRight size={11} color="#1764E8" strokeWidth={2.2} />
                      </View>
                    ) : isCompleted ? (
                      <Lock size={13} color="#94A3B8" />
                    ) : (
                      <CheckCircle2 size={16} color="#1764E8" strokeWidth={2.2} />
                    )}
                  </View>

                  {/* Date Stamp Row on the button */}
                  {formattedDate ? (
                    <View style={styles.stageDateRow}>
                      <Text style={[styles.stageDateText, isCurrent && styles.stageDateTextCurrent]}>
                        {isCurrent ? `Active since: ${formattedDate}` : `Completed on: ${formattedDate}`}
                      </Text>
                    </View>
                  ) : isUpcoming ? (
                    <View style={styles.stageDateRow}>
                      <Text style={styles.stagePendingDateText}>• Pending selection</Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <View style={styles.sectionDivider} />

        {/* 3. Rejection / Terminal Exit Stage */}
        <Text style={styles.sectionHeadingTitle}>APPLICATION DECISION</Text>
        {isRejected ? (
          <View style={styles.rejectedActiveCard}>
            <View style={styles.rejectedHeaderRow}>
              <AlertCircle size={16} color="#DC2626" strokeWidth={2.2} />
              <Text style={styles.rejectedTitleText}>Application Rejected</Text>
            </View>
            <Text style={styles.rejectedSubText}>
              This candidate application is marked as rejected and closed.
            </Text>
            {statusDates['rejected'] || (selectedApplicant as any)?.updated_at ? (
              <Text style={styles.rejectedDateText}>
                Closed on: {formatStatusDate(statusDates['rejected'] || (selectedApplicant as any)?.updated_at)}
              </Text>
            ) : null}
          </View>
        ) : (
          <TouchableOpacity
            style={styles.rejectOutlineBtn}
            activeOpacity={0.8}
            onPress={() => {
              if (selectedApplicant) {
                const activeJId = selectedApplicant.job_id || (selectedApplicant as any).jobId || jobId;
                onUpdateStatus(selectedApplicant.user_id, 'rejected', activeJId);
              }
            }}
          >
            <AlertCircle size={15} color="#DC2626" strokeWidth={2} />
            <Text style={styles.rejectOutlineBtnText}>Reject & Close Application</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 14,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#E7EBF2',
    padding: 14,
    shadowColor: '#142A50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  headerOverviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeadingTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#657796',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  workflowHelperText: {
    fontSize: 11,
    color: '#657796',
    lineHeight: 15,
    marginBottom: 10,
  },
  currentBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  activeStageMeta: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#102A5C',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#E7EBF2',
    marginVertical: 12,
  },

  // ── Stepper Pipeline ──
  stepperContainer: {
    marginTop: 2,
  },
  stepRowWrapper: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 10,
  },
  stepIndicatorCol: {
    width: 24,
    alignItems: 'center',
    marginRight: 10,
    position: 'relative',
  },
  stepConnectorLine: {
    position: 'absolute',
    top: 22,
    bottom: -10,
    width: 2,
    backgroundColor: '#E2E8F0',
    zIndex: 1,
  },
  stepConnectorLineDone: {
    backgroundColor: '#10B981',
  },
  stepNodeDone: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    zIndex: 2,
  },
  stepNodeActive: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EEF4FF',
    borderWidth: 2,
    borderColor: '#1764E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    zIndex: 2,
  },
  stepNodeActiveInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1764E8',
  },
  stepNodeUpcoming: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    zIndex: 2,
  },
  stepNodeUpcomingText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
  },

  // ── Stage Cards ──
  stageActionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    gap: 4,
  },
  stageActionCardCurrent: {
    backgroundColor: '#EFF6FF',
    borderColor: '#1764E8',
    borderWidth: 1.5,
  },
  stageActionCardCompleted: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  stageActionCardUpcoming: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
  },
  stageCardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleWithBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 2,
  },
  stageTitleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#102A5C',
  },
  stageTitleTextCurrent: {
    color: '#1764E8',
  },
  stageTitleTextCompleted: {
    color: '#334155',
  },
  activeTagBadge: {
    backgroundColor: '#1764E8',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  activeTagBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  completedTagBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  completedTagBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#059669',
  },
  stageDescText: {
    fontSize: 11,
    color: '#657796',
    lineHeight: 15,
  },
  promoteActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  promoteActionPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#1764E8',
  },
  stageDateRow: {
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  stageDateText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#059669',
  },
  stageDateTextCurrent: {
    color: '#1764E8',
  },
  stagePendingDateText: {
    fontSize: 10.5,
    color: '#94A3B8',
    fontWeight: '500',
  },

  // ── Rejection Terminal Card ──
  rejectedActiveCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 8,
    padding: 12,
    gap: 4,
  },
  rejectedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rejectedTitleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626',
  },
  rejectedSubText: {
    fontSize: 11,
    color: '#7F1D1D',
    lineHeight: 15,
  },
  rejectedDateText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#DC2626',
    marginTop: 2,
  },
  rejectOutlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    marginTop: 4,
  },
  rejectOutlineBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
});
