import { useLocation, useNavigate } from "react-router-dom";
import {
  Typography,
  Button,
  Paper,
  Chip,
  Box,
  Stack,
  Container,
} from "@mui/material";
import "../styles/Result.css";

function formatIssueList(issues) {
  if (Array.isArray(issues)) return issues.join(", ");
  if (typeof issues === "string") return issues;
  return String(issues);
}

function parseInsight(insight) {
  if (typeof insight !== "string") return { tag: "INFO", body: String(insight) };
  const m = insight.match(/^\[([^\]]+)\]\s*(.*)$/s);
  if (m) return { tag: m[1], body: m[2] };
  return { tag: "INFO", body: insight };
}

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const { edaReport, fileName } = location.state || {};

  if (!edaReport) {
    return (
      <div className="page-center">
        <div className="center-box">
          <Typography variant="h5" color="error" component="h1" gutterBottom>
            No EDA data found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Upload a CSV from the upload page to see your report here.
          </Typography>
          <Button variant="contained" sx={{ mt: 1 }} onClick={() => navigate("/upload")}>
            Back to Upload
          </Button>
        </div>
      </div>
    );
  }

  const {
    dataset_summary = {},
    data_quality_issues = {},
    insights = [],
    column_types = {},
    missing_analysis = {},
  } = edaReport;

  const ds = dataset_summary || {};

  return (
    <Box
      component="section"
      className="result-page"
      sx={{
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 1.5, sm: 2 },
        width: "100%",
        minHeight: "100%",
        bgcolor: "background.default",
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2 } }}>
        <Stack spacing={{ xs: 2, md: 3 }}>
          <Box sx={{ textAlign: { xs: "left", sm: "center" } }}>
            <Typography
              variant="h4"
              component="h1"
              fontWeight={800}
              sx={{
                fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
                background: "linear-gradient(135deg, #667eea 0%, #f5576c 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              EDA report
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Dataset: <strong>{fileName || "uploaded file"}</strong>
            </Typography>
          </Box>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={{ xs: 2, md: 3 }}
            alignItems="stretch"
          >
            <Paper
              className="result-paper"
              elevation={3}
              sx={{
                p: { xs: 2, sm: 3 },
                flex: 1,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "rgba(102, 126, 234, 0.25)",
              }}
            >
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ pb: 1, borderBottom: 1, borderColor: "divider" }}>
                Dataset summary
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(2, 1fr)" },
                  gap: 2,
                  mt: 2,
                }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Rows
                  </Typography>
                  <Typography variant="h6" component="p">
                    {(ds.num_rows ?? 0).toLocaleString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Columns
                  </Typography>
                  <Typography variant="h6" component="p">
                    {ds.num_columns ?? 0}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Duplicate rows
                  </Typography>
                  <Typography
                    variant="h6"
                    component="p"
                    color={ds.duplicate_rows > 0 ? "error.main" : "text.primary"}
                  >
                    {ds.duplicate_rows ?? 0} ({ds.duplicate_percent ?? 0}%)
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Memory saved
                  </Typography>
                  <Typography variant="h6" component="p" color="success.main">
                    −{ds.memory_reduction_percent ?? 0}%
                  </Typography>
                </Box>
                <Box sx={{ gridColumn: { xs: "1 / -1", sm: "auto" } }}>
                  <Typography variant="caption" color="text.secondary">
                    Memory (original → optimized)
                  </Typography>
                  <Typography variant="body1">
                    {ds.memory_usage_mb ?? "—"} MB → {ds.memory_optimized_mb ?? "—"} MB
                  </Typography>
                </Box>
              </Box>
            </Paper>

            <Paper
              className="result-paper"
              elevation={3}
              sx={{
                p: { xs: 2, sm: 3 },
                flex: 1,
                borderRadius: 2,
                border: "1px solid",
                borderColor:
                  Object.keys(data_quality_issues || {}).length > 0
                    ? "rgba(245, 87, 108, 0.35)"
                    : "rgba(102, 126, 234, 0.25)",
                bgcolor:
                  Object.keys(data_quality_issues || {}).length > 0
                    ? "rgba(245, 87, 108, 0.06)"
                    : "background.paper",
              }}
            >
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ pb: 1, borderBottom: 1, borderColor: "divider" }}>
                Data quality
              </Typography>
              {ds.duplicate_warning && (
                <Chip
                  label={ds.duplicate_warning}
                  color="error"
                  variant="outlined"
                  sx={{ mt: 1.5, mb: 1, height: "auto", "& .MuiChip-label": { whiteSpace: "normal", py: 1 } }}
                />
              )}
              {Object.keys(data_quality_issues || {}).length === 0 ? (
                <Typography color="success.main" sx={{ mt: 2 }}>
                  No extra formatting issues flagged for categoricals / numerics checked.
                </Typography>
              ) : (
                <Box component="ul" sx={{ m: 0, pl: 2.5, mt: 1.5, color: "text.secondary" }}>
                  {Object.entries(data_quality_issues).map(([col, issues]) => (
                    <Typography component="li" key={col} sx={{ mb: 1 }}>
                      <strong>{col}</strong>: {formatIssueList(issues)}
                    </Typography>
                  ))}
                </Box>
              )}
            </Paper>
          </Stack>

          <Stack direction={{ xs: "column", lg: "row" }} spacing={{ xs: 2, lg: 3 }}>
            <Paper
              className="result-paper"
              elevation={3}
              sx={{
                p: { xs: 2, sm: 3 },
                flex: { lg: "0 0 34%" },
                borderRadius: 2,
                border: "1px solid",
                borderColor: "rgba(102, 126, 234, 0.25)",
              }}
            >
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ pb: 1, borderBottom: 1, borderColor: "divider" }}>
                Column types
              </Typography>
              <Stack spacing={1.5} sx={{ mt: 2 }}>
                {Object.entries(column_types || {}).map(([type, cols]) => {
                  if (!cols?.length) return null;
                  if (["numeric_continuous", "numeric_discrete"].includes(type)) return null;
                  let color = "default";
                  if (type === "numeric") color = "primary";
                  if (type === "categorical") color = "secondary";
                  if (type === "datetime") color = "success";
                  if (type === "id_like") color = "warning";
                  return (
                    <Box key={type}>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: "capitalize", display: "block", mb: 0.5 }}>
                        {type.replace(/_/g, " ")} ({cols.length})
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                        {cols.map((c) => (
                          <Chip key={c} label={c} size="small" color={color} variant="outlined" />
                        ))}
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            </Paper>

            <Paper
              className="result-paper"
              elevation={3}
              sx={{
                p: { xs: 2, sm: 3 },
                flex: 1,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "rgba(102, 126, 234, 0.25)",
                minWidth: 0,
              }}
            >
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ pb: 1, borderBottom: 1, borderColor: "divider" }}>
                Missing values
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(auto-fill, minmax(220px, 1fr))",
                  },
                  gap: 2,
                  mt: 2,
                }}
              >
                {Object.entries(missing_analysis || {}).map(([col, data]) => {
                  if (!data || data.missing_count === 0) return null;
                  const p = data.missing_percent ?? 0;
                  const pColor = p > 40 ? "#ef4444" : p > 5 ? "#f59e0b" : "#3b82f6";
                  return (
                    <Box
                      key={col}
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        p: 1.5,
                        borderRadius: 1,
                        bgcolor: "rgba(0,0,0,0.15)",
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight={700}>
                        {col}
                      </Typography>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          {data.missing_count} missing
                        </Typography>
                        <Typography variant="caption" fontWeight={700} sx={{ color: pColor }}>
                          {p}%
                        </Typography>
                      </Box>
                      <Box sx={{ width: "100%", height: 6, bgcolor: "action.hover", borderRadius: 1, overflow: "hidden", mt: 1 }}>
                        <Box sx={{ width: `${Math.min(p, 100)}%`, height: "100%", bgcolor: pColor }} />
                      </Box>
                      {data.imputation_recommendation && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1, lineHeight: 1.35 }}>
                          {data.imputation_recommendation}
                        </Typography>
                      )}
                    </Box>
                  );
                })}
                {Object.values(missing_analysis || {}).every((d) => !d || d.missing_count === 0) && (
                  <Typography color="success.main" sx={{ gridColumn: "1 / -1" }}>
                    No missing values in any column.
                  </Typography>
                )}
              </Box>
            </Paper>
          </Stack>

          <Paper
            className="result-paper"
            elevation={3}
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: 2,
              border: "1px solid",
              borderColor: "rgba(102, 126, 234, 0.25)",
              bgcolor: "rgba(102, 126, 234, 0.06)",
            }}
          >
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ pb: 1, borderBottom: 1, borderColor: "divider" }}>
              ML-style recommendations
            </Typography>
            {insights && insights.length > 0 ? (
              <Stack spacing={1.5} sx={{ mt: 2 }}>
                {insights.map((insight, idx) => {
                  const { tag, body } = parseInsight(insight);
                  let chipColor = "info";
                  if (tag.includes("WARNING") || tag.includes("warning")) chipColor = "error";
                  if (tag.includes("INFO")) chipColor = "primary";
                  return (
                    <Box
                      key={idx}
                      sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        alignItems: { xs: "flex-start", sm: "flex-start" },
                        gap: { xs: 1, sm: 2 },
                        p: 1.5,
                        borderRadius: 1,
                        bgcolor: "background.paper",
                        border: "1px solid",
                        borderColor: "divider",
                        transition: "background-color 0.2s",
                        "&:hover": { bgcolor: "action.hover" },
                      }}
                    >
                      <Chip label={tag} color={chipColor} size="small" sx={{ fontWeight: 700, flexShrink: 0 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, flex: 1 }}>
                        {body}
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
            ) : (
              <Typography color="text.secondary" sx={{ mt: 2 }}>
                No extra insights were generated for this dataset.
              </Typography>
            )}
          </Paper>

          <Box sx={{ display: "flex", justifyContent: "center", pt: 1, pb: { xs: 3, md: 4 } }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/upload")}
              sx={{ px: 4, py: 1.5, fontWeight: 700 }}
            >
              Analyze another dataset
            </Button>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
