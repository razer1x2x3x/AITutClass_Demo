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
 const reason = code === 'insufficient_quota' ? 'provider_quota'
  : response.status === 401 ? 'provider_auth'
  : code === 'model_not_found' || response.status === 404 ? 'provider_model'
  : response.status === 403 ? 'provider_permission'
  : response.status === 429 ? 'provider_rate_limit'
  : response.status === 400 ? 'provider_request' : 'provider_unavailable';
 return aiError(reason);
}
