<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>LearningHun Certificate</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            margin: 0;
            padding: 0;
            background: #f8fafc;
        }
        .wrapper {
            width: 100%;
            height: 100%;
            padding: 48px;
            box-sizing: border-box;
        }
        .card {
            width: 100%;
            height: 100%;
            border: 8px solid #2563EB;
            border-radius: 20px;
            background: #ffffff;
            padding: 48px;
            box-sizing: border-box;
            text-align: center;
            position: relative;
        }
        .brand {
            font-size: 24px;
            font-weight: 700;
            color: #2563EB;
            letter-spacing: 1px;
        }
        .subtitle {
            margin-top: 12px;
            font-size: 16px;
            color: #334155;
        }
        .title {
            margin-top: 32px;
            font-size: 42px;
            font-weight: 700;
            color: #0f172a;
        }
        .student {
            margin-top: 28px;
            font-size: 34px;
            font-weight: 700;
            color: #16A34A;
        }
        .course {
            margin-top: 18px;
            font-size: 22px;
            color: #0f172a;
        }
        .meta {
            margin-top: 38px;
            font-size: 14px;
            color: #475569;
        }
        .verify {
            margin-top: 16px;
            font-size: 12px;
            color: #2563EB;
            word-break: break-all;
        }
        .qr {
            margin-top: 14px;
            display: inline-block;
            padding: 8px;
            border: 1px solid #cbd5e1;
            border-radius: 10px;
            background: #ffffff;
        }
        .footer {
            position: absolute;
            bottom: 28px;
            left: 0;
            right: 0;
            font-size: 12px;
            color: #64748b;
        }
    </style>
</head>
<body>
<div class="wrapper">
    <div class="card">
        <div class="brand">LEARNINGHUN</div>
        <div class="subtitle">Certificate of Course Completion</div>
        <div class="title">This certifies that</div>
        <div class="student">{{ $studentName }}</div>
        <div class="course">has successfully completed <strong>{{ $courseTitle }}</strong></div>
        <div class="meta">
            Certificate No: {{ $certificateNumber }}<br>
            Issued on: {{ $issuedAt }}
        </div>
        <div class="verify">
            Verify this certificate:<br>
            {{ $verificationUrl }}
        </div>
        <div class="qr">
            {!! $verificationQrSvg !!}
        </div>
        <div class="footer">LearningHun LMS • Enterprise Learning Platform</div>
    </div>
</div>
</body>
</html>

