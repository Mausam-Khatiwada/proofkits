import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Code2, Layers, Palette } from 'lucide-react';
import type { Widget } from '@/lib/types';
import { CopyButton } from '@/components/dashboard/CopyButton';

export default async function EmbedLibraryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: widgets } = await supabase
    .from('widgets')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-sm border-b border-[#EDE9FE] pl-14 pr-4 md:px-8 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            Embed Library
          </h1>
          <p className="text-sm text-[#7C6D9A] -mt-0.5">
            Copy embed codes to display testimonials anywhere
          </p>
        </div>
        <Link
          href="/style-gallery"
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Palette className="w-4 h-4" />
          Browse Styles
        </Link>
      </header>

      <div className="px-4 py-6 md:px-8">
        {!widgets || widgets.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#EDE9FE] p-16 text-center">
            <Code2 className="w-12 h-12 text-violet-200 mx-auto" />
            <p className="text-gray-400 font-medium mt-3">
              No widgets created yet
            </p>
            <p className="text-sm text-gray-300 mt-1">
              Create a widget to get embed codes
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {(widgets as Widget[]).map((w) => {
              const embedHTML = `<div id="proofengine-widget"></div>\n<script src="${appUrl}/widget.js" data-widget-slug="${w.slug}"></script>`;
              const collectURL = `${appUrl}/collect/${w.slug}`;
              const apiURL = `${appUrl}/api/embed/${w.slug}/testimonials`;

              return (
                <div
                  key={w.id}
                  className="bg-white rounded-2xl border border-[#EDE9FE] p-6 shadow-[0_1px_3px_rgba(124,58,237,0.06)] hover:shadow-[0_4px_20px_rgba(124,58,237,0.08)] transition-shadow duration-200"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-violet-500 flex items-center justify-center">
                      <Layers className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-gray-800">
                        {w.name}
                      </h3>
                      <p className="text-xs text-gray-400">/{w.slug}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <EmbedBlock
                      label="Widget Embed Code"
                      description="Paste this into your website HTML"
                      code={embedHTML}
                    />
                    <EmbedBlock
                      label="Collection URL"
                      description="Share this link to collect testimonials"
                      code={collectURL}
                    />
                    <EmbedBlock
                      label="API Endpoint"
                      description="Fetch approved testimonials as JSON"
                      code={apiURL}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

function EmbedBlock({
  label,
  description,
  code,
}: {
  label: string;
  description: string;
  code: string;
}) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-xs font-medium text-gray-700">{label}</p>
          <p className="text-[10px] text-gray-400">{description}</p>
        </div>
        <CopyButton text={code} />
      </div>
      <pre className="text-xs text-gray-600 bg-white border border-gray-100 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all">
        {code}
      </pre>
    </div>
  );
}
