"use client";

import {Token} from "@/types";

interface TableProps {
    tokens: Token[];
}
// TODO: Colors for the types are still subject to change 
export default function Table({tokens}: TableProps) {
    const getTokenColor = (tokenType: string) => {
        switch (tokenType) {
            case 'FUNCTION':
                return 'text-purple-600 dark:text-purple-400 font-semibold';
            case 'UNKNOWN_IDENTIFIER':
                return 'text-red-600 dark:text-red-400 font-semibold';
            case 'UNKNOWN':
                return 'text-red-500 dark:text-red-300';
            case 'PRIMITIVE_DATA':
            case 'CONDITIONAL_STATEMENT':
            case 'LOOP':
            case 'JUMP STATEMENT':
            case 'EXCEPTION_HANDLING':
            case 'STRUCTURE':
            case 'VARIABLE_MODIFIER':
                return 'text-blue-600 dark:text-blue-400 font-medium';
            case 'STRING':
                return 'text-green-600 dark:text-green-400';
            case 'NUMBER':
                return 'text-orange-600 dark:text-orange-400';
            case 'COMMENT':
                return 'text-gray-500 dark:text-gray-400 italic';
            default:
                return 'text-gray-700 dark:text-gray-300';
        }
    };

    return (
        <div className="h-full overflow-auto">
            <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-gray-100 dark:bg-gray-800">
                    <tr>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">
                            Lexeme
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">
                            Token
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">
                            Line
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">
                            Column
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {tokens.map((token, index) => (
                     <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 font-mono">
                          {token.value}
                        </td>
                        <td className={`border border-gray-300 dark:border-gray-600 px-4 py-2 ${getTokenColor(token.type)}`}>
                          {token.type}
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                         {token.line}
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                           {token.column}
                         </td>
                     </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}