import { LANGUAGES } from '@const/enums';
import { ADMIN_FEEDBACK_COPY, getAdminFeedbackKindLabel } from './const';

describe('admin feedback labels', () => {
  it('maps supported and future feedback kinds to readable labels', () => {
    const copy = ADMIN_FEEDBACK_COPY[LANGUAGES.english];

    expect(getAdminFeedbackKindLabel('question', copy)).toBe(copy.question);
    expect(getAdminFeedbackKindLabel('bug', copy)).toBe(copy.bug);
    expect(getAdminFeedbackKindLabel('feature', copy)).toBe(copy.feature);
    expect(getAdminFeedbackKindLabel('legacy', copy)).toBe(copy.other);
  });
});
