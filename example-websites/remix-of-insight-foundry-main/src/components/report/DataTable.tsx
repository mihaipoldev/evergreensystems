import { motion } from "framer-motion";
import { ReactNode } from "react";

interface DataTableProps {
  headers: string[];
  rows: (string | ReactNode)[][];
  caption?: string;
}

export const DataTable = ({ headers, rows, caption }: DataTableProps) => {
  return (
    <div className="overflow-x-auto mb-6">
      <motion.table
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="w-full border-collapse"
      >
        {caption && (
          <caption className="text-left text-sm text-muted-foreground mb-3 font-body">
            {caption}
          </caption>
        )}
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="text-left text-xs uppercase tracking-wider text-muted-foreground font-body font-semibold py-3 px-4 bg-secondary border-b-2 border-accent first:rounded-tl-md last:rounded-tr-md"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <motion.tr
              key={rowIndex}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: rowIndex * 0.05 }}
              className="border-b border-border hover:bg-muted/50 transition-colors"
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="py-3 px-4 text-sm font-body text-foreground"
                >
                  {cell}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </motion.table>
    </div>
  );
};
