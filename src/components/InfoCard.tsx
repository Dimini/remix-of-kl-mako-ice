import { ExternalLink } from "lucide-react";

interface InfoCardProps {
  title: string;
  content: Array<{ text: string; link?: { url: string; text: string } }>;
  icon?: React.ReactNode;
}

export function InfoCard({ title, content, icon }: InfoCardProps) {
  return (
    <div className="bg-card rounded-lg border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-4">
        {icon && (
          <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
      </div>
      
      <ul className="space-y-3 text-sm text-muted-foreground">
        {content.map((item, index) => (
          <li key={index} className="flex items-start">
            <span className="flex-shrink-0 w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-3" />
            <span className="flex-1">
              {item.text}
              {item.link && (
                <>
                  {" "}
                  <a 
                    href={item.link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                  >
                    {item.link.text}
                    <ExternalLink size={12} />
                  </a>
                </>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}