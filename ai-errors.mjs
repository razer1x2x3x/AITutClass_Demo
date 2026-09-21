// Only fixed diagnostic codes may reach logs or the browser. Never log provider
// messages, request bodies, credentials, or student text.
const reasons = new Set(['provider_quota','provider_auth','provider_model','provider_permission','provider_rate_limit','provider_request','provider_unavailable','analysis_timeout','analysis_network','analysis_incomplete','analysis_refused','analysis_invalid_response']);
export function aiError(reason) { return Object.assign(new Error(reason), {aiReason:reason}); }
export function classifyAIError(error) {
 if (reasons.has(error?.aiReason)) return error.aiReason;
 if (error?.name === 'TimeoutError' || error?.name === 'AbortError') return 'analysis_timeout';
 if (error instanceof TypeError) return 'analysis_network';
 return 'analysis_invalid_response';
}
export async function providerError(response) {
 const data = await response.json().catch(()=>({}));
 const code = data?.error?.code;
 const quotaCodes=['insufficient_quota','credit_balance_exhausted','organization_spend_limit_exceeded','project_spend_limit_exceeded','organization_usage_limit_exceeded'];
 const reason = quotaCodes.includes(code) || data?.error?.type === 'insufficient_quota' ? 'provider_quota'
  : response.status === 401 ? 'provider_auth'
  : code === 'model_not_found' || response.status === 404 ? 'provider_model'
  : response.status === 403 ? 'provider_permission'
  : response.status === 429 ? 'provider_rate_limit'
  : response.status === 400 ? 'provider_request' : 'provider_unavailable';
 const error=aiError(reason);
 const safeCodes=[...quotaCodes,'invalid_api_key','model_not_found','rate_limit_exceeded','slow_down'];
 if(safeCodes.includes(code))error.providerCode=code;
 return error;
}
