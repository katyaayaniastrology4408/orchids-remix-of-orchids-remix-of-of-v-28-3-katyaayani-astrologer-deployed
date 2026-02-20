import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY!);

// --- Template HTML generators ---

function rashifalHtml() {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Rashifal</title></head>
<body style="margin:0;padding:0;background:#1a0a00;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a0a00;">
    <tr><td align="center" style="padding:32px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#22100a;border-radius:16px;overflow:hidden;border:1px solid #8b3a0f;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#8b1a00,#c45200);padding:32px 24px;text-align:center;">
            <div style="font-size:40px;margin-bottom:8px;">🔯</div>
            <h1 style="margin:0;color:#ffd700;font-size:26px;letter-spacing:2px;font-family:'Georgia',serif;">Katyaayani Astrologer</h1>
            <p style="margin:8px 0 0;color:#ffb347;font-size:13px;letter-spacing:4px;text-transform:uppercase;">Weekly Rashifal</p>
          </td>
        </tr>
        <!-- Greeting -->
        <tr>
          <td style="padding:28px 32px 0;text-align:center;">
            <p style="color:#ffd700;font-size:18px;margin:0;">Namaste {{{NAME}}} 🙏</p>
            <p style="color:#d4a574;font-size:14px;margin:10px 0 0;">Here is your cosmic guidance for the week ahead</p>
            <div style="width:60px;height:2px;background:linear-gradient(90deg,transparent,#ffd700,transparent);margin:16px auto 0;"></div>
          </td>
        </tr>
        <!-- Rashi -->
        <tr>
          <td style="padding:24px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#2d1208;border:1px solid #8b3a0f;border-radius:12px;padding:20px 24px;">
                  <p style="color:#ffd700;font-size:13px;text-transform:uppercase;letter-spacing:3px;margin:0 0 8px;">Your Rashi Forecast</p>
                  <p style="color:#e8d5b7;font-size:16px;line-height:1.8;margin:0;">{{{RASHIFAL_TEXT}}}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Lucky Details -->
        <tr>
          <td style="padding:0 32px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="33%" style="padding:4px;">
                  <div style="background:#2d1208;border:1px solid #8b3a0f;border-radius:10px;padding:14px;text-align:center;">
                    <p style="color:#ffd700;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 6px;">Lucky Number</p>
                    <p style="color:#ffb347;font-size:22px;font-weight:bold;margin:0;">{{{LUCKY_NUMBER}}}</p>
                  </div>
                </td>
                <td width="33%" style="padding:4px;">
                  <div style="background:#2d1208;border:1px solid #8b3a0f;border-radius:10px;padding:14px;text-align:center;">
                    <p style="color:#ffd700;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 6px;">Lucky Color</p>
                    <p style="color:#ffb347;font-size:15px;font-weight:bold;margin:0;">{{{LUCKY_COLOR}}}</p>
                  </div>
                </td>
                <td width="33%" style="padding:4px;">
                  <div style="background:#2d1208;border:1px solid #8b3a0f;border-radius:10px;padding:14px;text-align:center;">
                    <p style="color:#ffd700;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 6px;">Period</p>
                    <p style="color:#ffb347;font-size:12px;font-weight:bold;margin:0;">{{{PERIOD}}}</p>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- CTA -->
        <tr>
          <td style="padding:0 32px 32px;text-align:center;">
            <a href="https://www.katyaayaniastrologer.com/booking" style="display:inline-block;background:linear-gradient(135deg,#c45200,#ff6b35);color:#fff;text-decoration:none;padding:14px 32px;border-radius:50px;font-size:14px;font-weight:bold;letter-spacing:1px;">Book Personal Consultation</a>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#0d0600;padding:20px 32px;text-align:center;border-top:1px solid #8b3a0f;">
            <p style="color:#8b5e3c;font-size:11px;margin:0 0 6px;">Katyaayani Astrologer | Vedic Astrology &amp; Spiritual Guidance</p>
            <p style="color:#5a3a2a;font-size:10px;margin:0;"><a href="https://www.katyaayaniastrologer.com" style="color:#8b5e3c;text-decoration:none;">katyaayaniastrologer.com</a> &nbsp;|&nbsp; <a href="{{{UNSUBSCRIBE_URL}}}" style="color:#8b5e3c;text-decoration:none;">Unsubscribe</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function festivalHtml() {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Festival Muhurat</title></head>
<body style="margin:0;padding:0;background:#0a0a1a;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a1a;">
    <tr><td align="center" style="padding:32px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#12122a;border-radius:16px;overflow:hidden;border:1px solid #4a3080;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#2d1b69,#7c3aed);padding:32px 24px;text-align:center;">
            <div style="font-size:44px;margin-bottom:8px;">{{{FESTIVAL_EMOJI}}}</div>
            <h1 style="margin:0;color:#ffd700;font-size:24px;letter-spacing:2px;">Katyaayani Astrologer</h1>
            <p style="margin:8px 0 0;color:#c4b5fd;font-size:13px;letter-spacing:4px;text-transform:uppercase;">Festival &amp; Muhurat Guide</p>
          </td>
        </tr>
        <!-- Festival Name -->
        <tr>
          <td style="padding:28px 32px 0;text-align:center;">
            <h2 style="color:#ffd700;font-size:28px;margin:0;">{{{FESTIVAL_NAME}}}</h2>
            <p style="color:#a78bfa;font-size:14px;margin:10px 0 0;">{{{FESTIVAL_DATE}}}</p>
            <div style="width:60px;height:2px;background:linear-gradient(90deg,transparent,#ffd700,transparent);margin:16px auto 0;"></div>
          </td>
        </tr>
        <!-- Main Content -->
        <tr>
          <td style="padding:24px 32px;">
            <div style="background:#1e1b4b;border:1px solid #4a3080;border-radius:12px;padding:24px;">
              <p style="color:#e2d9ff;font-size:15px;line-height:1.8;margin:0;">{{{FESTIVAL_DESCRIPTION}}}</p>
            </div>
          </td>
        </tr>
        <!-- Muhurat -->
        <tr>
          <td style="padding:0 32px 16px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#1e1b4b;border:1px solid #7c3aed;border-radius:12px;padding:20px 24px;">
                  <p style="color:#a78bfa;font-size:12px;text-transform:uppercase;letter-spacing:3px;margin:0 0 12px;">✨ Shubh Muhurat</p>
                  <p style="color:#ffd700;font-size:18px;font-weight:bold;margin:0 0 6px;">{{{MUHURAT_TIME}}}</p>
                  <p style="color:#c4b5fd;font-size:13px;margin:0;">{{{MUHURAT_DETAILS}}}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Remedy -->
        <tr>
          <td style="padding:0 32px 28px;">
            <div style="background:#0f172a;border-left:3px solid #ffd700;border-radius:0 8px 8px 0;padding:16px 20px;">
              <p style="color:#ffd700;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px;">Puja Vidhi &amp; Upay</p>
              <p style="color:#cbd5e1;font-size:14px;line-height:1.7;margin:0;">{{{REMEDY}}}</p>
            </div>
          </td>
        </tr>
        <!-- CTA -->
        <tr>
          <td style="padding:0 32px 32px;text-align:center;">
            <a href="https://www.katyaayaniastrologer.com/booking" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#9f67ff);color:#fff;text-decoration:none;padding:14px 32px;border-radius:50px;font-size:14px;font-weight:bold;letter-spacing:1px;">Get Personal Muhurat Reading</a>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#050510;padding:20px 32px;text-align:center;border-top:1px solid #4a3080;">
            <p style="color:#4a3080;font-size:11px;margin:0 0 6px;">Katyaayani Astrologer | Vedic Astrology &amp; Spiritual Guidance</p>
            <p style="color:#2d1b69;font-size:10px;margin:0;"><a href="https://www.katyaayaniastrologer.com" style="color:#4a3080;text-decoration:none;">katyaayaniastrologer.com</a> &nbsp;|&nbsp; <a href="{{{UNSUBSCRIBE_URL}}}" style="color:#4a3080;text-decoration:none;">Unsubscribe</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function tipsHtml() {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Astro Tips</title></head>
<body style="margin:0;padding:0;background:#0d0800;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0800;">
    <tr><td align="center" style="padding:32px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#1a1000;border-radius:16px;overflow:hidden;border:1px solid #8b6914;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#78350f,#d97706);padding:32px 24px;text-align:center;">
            <div style="font-size:40px;margin-bottom:8px;">⭐</div>
            <h1 style="margin:0;color:#fff;font-size:24px;letter-spacing:2px;">Katyaayani Astrologer</h1>
            <p style="margin:8px 0 0;color:#fde68a;font-size:13px;letter-spacing:4px;text-transform:uppercase;">Astrology Tips &amp; Guidance</p>
          </td>
        </tr>
        <!-- Greeting -->
        <tr>
          <td style="padding:28px 32px 0;text-align:center;">
            <p style="color:#fbbf24;font-size:18px;margin:0;">Namaste {{{NAME}}} 🙏</p>
            <div style="width:60px;height:2px;background:linear-gradient(90deg,transparent,#fbbf24,transparent);margin:16px auto 0;"></div>
          </td>
        </tr>
        <!-- Tip Title -->
        <tr>
          <td style="padding:24px 32px 12px;text-align:center;">
            <h2 style="color:#ffd700;font-size:22px;margin:0;">{{{TIP_TITLE}}}</h2>
          </td>
        </tr>
        <!-- Tip Content -->
        <tr>
          <td style="padding:0 32px 24px;">
            <div style="background:#261800;border:1px solid #8b6914;border-radius:12px;padding:24px;">
              <p style="color:#e8d5b7;font-size:15px;line-height:1.9;margin:0;">{{{TIP_CONTENT}}}</p>
            </div>
          </td>
        </tr>
        <!-- Remedy Box -->
        <tr>
          <td style="padding:0 32px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="50%" style="padding:4px;">
                  <div style="background:#261800;border:1px solid #8b6914;border-radius:10px;padding:16px;text-align:center;">
                    <p style="color:#fbbf24;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px;">Graha</p>
                    <p style="color:#ffd700;font-size:18px;font-weight:bold;margin:0;">{{{PLANET}}}</p>
                  </div>
                </td>
                <td width="50%" style="padding:4px;">
                  <div style="background:#261800;border:1px solid #8b6914;border-radius:10px;padding:16px;text-align:center;">
                    <p style="color:#fbbf24;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px;">Upay (Remedy)</p>
                    <p style="color:#fde68a;font-size:13px;font-weight:bold;margin:0;">{{{REMEDY}}}</p>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- CTA -->
        <tr>
          <td style="padding:0 32px 32px;text-align:center;">
            <a href="https://www.katyaayaniastrologer.com/booking" style="display:inline-block;background:linear-gradient(135deg,#d97706,#f59e0b);color:#fff;text-decoration:none;padding:14px 32px;border-radius:50px;font-size:14px;font-weight:bold;letter-spacing:1px;">Book Your Consultation</a>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#080500;padding:20px 32px;text-align:center;border-top:1px solid #8b6914;">
            <p style="color:#6b4c0a;font-size:11px;margin:0 0 6px;">Katyaayani Astrologer | Vedic Astrology &amp; Spiritual Guidance</p>
            <p style="color:#4a330a;font-size:10px;margin:0;"><a href="https://www.katyaayaniastrologer.com" style="color:#6b4c0a;text-decoration:none;">katyaayaniastrologer.com</a> &nbsp;|&nbsp; <a href="{{{UNSUBSCRIBE_URL}}}" style="color:#6b4c0a;text-decoration:none;">Unsubscribe</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// GET: list templates from Resend
export async function GET() {
  try {
    const res = await fetch('https://api.resend.com/templates', {
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
    });
    const data = await res.json();
    return NextResponse.json({ success: true, templates: data.data || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST: create + publish templates
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === 'setup') {
      // Create all 3 templates and publish them
      const templates = [
        {
          name: 'katyaayani-rashifal',
          html: rashifalHtml(),
          variables: [
            { key: 'NAME', type: 'string', fallbackValue: 'Devotee' },
            { key: 'RASHIFAL_TEXT', type: 'string', fallbackValue: 'This week brings positive energy. Stay focused on your goals.' },
            { key: 'LUCKY_NUMBER', type: 'string', fallbackValue: '7' },
            { key: 'LUCKY_COLOR', type: 'string', fallbackValue: 'Golden' },
            { key: 'PERIOD', type: 'string', fallbackValue: 'This Week' },
            { key: 'UNSUBSCRIBE_URL', type: 'string', fallbackValue: 'https://www.katyaayaniastrologer.com/unsubscribe' },
          ],
        },
        {
          name: 'katyaayani-festival',
          html: festivalHtml(),
          variables: [
            { key: 'FESTIVAL_EMOJI', type: 'string', fallbackValue: '🪔' },
            { key: 'FESTIVAL_NAME', type: 'string', fallbackValue: 'Upcoming Festival' },
            { key: 'FESTIVAL_DATE', type: 'string', fallbackValue: 'Coming Soon' },
            { key: 'FESTIVAL_DESCRIPTION', type: 'string', fallbackValue: 'Celebrate this auspicious occasion with devotion and joy.' },
            { key: 'MUHURAT_TIME', type: 'string', fallbackValue: '6:00 AM - 8:00 AM' },
            { key: 'MUHURAT_DETAILS', type: 'string', fallbackValue: 'Most auspicious time for puja and new beginnings.' },
            { key: 'REMEDY', type: 'string', fallbackValue: 'Light a diya, chant the mantra with devotion.' },
            { key: 'UNSUBSCRIBE_URL', type: 'string', fallbackValue: 'https://www.katyaayaniastrologer.com/unsubscribe' },
          ],
        },
        {
          name: 'katyaayani-astro-tips',
          html: tipsHtml(),
          variables: [
            { key: 'NAME', type: 'string', fallbackValue: 'Devotee' },
            { key: 'TIP_TITLE', type: 'string', fallbackValue: 'Weekly Cosmic Insight' },
            { key: 'TIP_CONTENT', type: 'string', fallbackValue: 'The planets are aligned to bring you positive energy this week.' },
            { key: 'PLANET', type: 'string', fallbackValue: 'Shukra' },
            { key: 'REMEDY', type: 'string', fallbackValue: 'Wear white on Friday' },
            { key: 'UNSUBSCRIBE_URL', type: 'string', fallbackValue: 'https://www.katyaayaniastrologer.com/unsubscribe' },
          ],
        },
      ];

      const results = [];
      for (const tmpl of templates) {
        try {
          // Create template
          const createRes = await fetch('https://api.resend.com/templates', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(tmpl),
          });
          const createData = await createRes.json();

          if (createData.id) {
            // Publish template
            const publishRes = await fetch(`https://api.resend.com/templates/${createData.id}/publish`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
            });
            const publishData = await publishRes.json();
            results.push({ name: tmpl.name, id: createData.id, published: !!publishData.id, data: createData });
          } else {
            results.push({ name: tmpl.name, error: createData.message || 'Failed to create', data: createData });
          }
        } catch (err: any) {
          results.push({ name: tmpl.name, error: err.message });
        }
      }

      return NextResponse.json({ success: true, results });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
