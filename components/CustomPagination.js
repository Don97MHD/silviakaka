import React from 'react';
import Link from 'next/link';
import { getRecipePageLink } from '../lib/utils';

const CustomPagination = ({ currentPage, numPages, prevText = 'Föregående', nextText = 'Nästa', additionalClasses = [] }) => {
    if (numPages <= 1) {
        return null;
    }

    const CcurrentPage = parseInt(currentPage, 10);
    const CnumPages = parseInt(numPages, 10);

    const isFirstPageActive = CcurrentPage === 1;
    const isLastPageActive = CcurrentPage === CnumPages;

    let pageItems = []; // Will store numbers or '...'
    const pagesToShowAroundCurrent = 1; // Show 1 page before current, current, 1 page after current
    const ellipsis = '...';

    // Always add page 1
    pageItems.push(1);

    // Calculate range for middle pages
    let rangeStart = Math.max(2, CcurrentPage - pagesToShowAroundCurrent);
    let rangeEnd = Math.min(CnumPages - 1, CcurrentPage + pagesToShowAroundCurrent);

    // Adjust range if current page is near the start or end
    if (CcurrentPage <= pagesToShowAroundCurrent + 1) { // e.g. if current is 1, 2, or 3 (for pagesToShowAroundCurrent=1)
        rangeEnd = Math.min(CnumPages - 1, 1 + pagesToShowAroundCurrent * 2 +1); // Ensure enough space for middle block
    }
    if (CcurrentPage >= CnumPages - pagesToShowAroundCurrent) { // e.g. if current is last, last-1, or last-2
        rangeStart = Math.max(2, CnumPages - (pagesToShowAroundCurrent * 2+1) );
    }
    
    // Add left ellipsis if needed
    if (rangeStart > 2) {
        pageItems.push(ellipsis);
    }

    // Add middle page numbers
    for (let i = rangeStart; i <= rangeEnd; i++) {
        pageItems.push(i);
    }

    // Add right ellipsis if needed
    if (rangeEnd < CnumPages - 1) {
        pageItems.push(ellipsis);
    }

    // Always add last page if numPages > 1
    if (CnumPages > 1) {
        pageItems.push(CnumPages);
    }
    
    // Remove duplicates that might arise from small numPages values (e.g. [1, ..., 2, 2] becomes [1, ..., 2])
    // And ensure ellipsis is not redundant if only one page separates it from 1 or numPages
    let uniquePageItems = [];
    for (let i = 0; i < pageItems.length; i++) {
        if (pageItems[i] === ellipsis) {
            if (uniquePageItems[uniquePageItems.length - 1] !== ellipsis && // no consecutive ellipsis
                pageItems[i+1] && pageItems[i-1] && pageItems[i+1] - pageItems[i-1] > 1) { // ensure ellipsis is meaningful
                 uniquePageItems.push(pageItems[i]);
            }
        } else if (uniquePageItems.indexOf(pageItems[i]) === -1) { // only add unique numbers
            uniquePageItems.push(pageItems[i]);
        }
    }
    // Final check: if [1, ..., 2], remove ellipsis.
    if (uniquePageItems.length === 3 && uniquePageItems[0] === 1 && uniquePageItems[1] === ellipsis && uniquePageItems[2] === 2) {
        uniquePageItems = [1, 2];
    }


    const commonLinkClasses = "inline-flex items-center justify-center px-4 py-2 text-sm font-medium border transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 ring-secondary";
    const activeLinkClasses = "bg-secondary text-white border-secondary";
    const defaultLinkClasses = "bg-white text-gray-700 border-gray-300 hover:bg-gray-100 hover:text-gray-800";
    const disabledLinkClasses = "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed";

    return (
        <nav className={['flex items-center justify-center space-x-px my-10 md:my-12', ...additionalClasses].join(' ')} aria-label="Sidnumrering">
            {!isFirstPageActive ? (
                <Link href={getRecipePageLink(CcurrentPage - 1)} title="Gå till föregående sida" className={`${commonLinkClasses} ${defaultLinkClasses} rounded-l-md`}>
                    {prevText}
                </Link>
            ) : (
                <span className={`${commonLinkClasses} ${disabledLinkClasses} rounded-l-md`}>
                    {prevText}
                </span>
            )}

            {uniquePageItems.map((page, index) => {
                if (page === ellipsis) {
                    return <span key={`ellipsis-${index}`} className="px-2 py-2 text-gray-500 self-end border-y border-gray-300">...</span>;
                }
                const pageLink = getRecipePageLink(page);
                const isCurrent = page === CcurrentPage;
                
                // Determine if this is the first or last *visible* numeric button in the sequence
                // This is for applying rounded corners if prev/next buttons are not present.
                // This logic is simplified as the prev/next buttons will always have the outer rounding.
                // Numbered buttons will be square unless they are the only button (numPages = 1, which is handled)
                // or if they are the very first/last item in a sequence without prev/next (not our case here).
                let roundedClasses = '';
                if (isFirstPageActive && index === 0) roundedClasses = 'rounded-l-md'; // If no prev button, round left of first number
                if (isLastPageActive && index === uniquePageItems.length - 1) roundedClasses = 'rounded-r-md'; // If no next button, round right of last number


                return (
                    <Link
                        key={`page-${page}`}
                        href={pageLink}
                        title={`Gå till sida ${page}`}
                        className={`${commonLinkClasses} ${isCurrent ? activeLinkClasses : defaultLinkClasses} ${roundedClasses}`}
                        aria-current={isCurrent ? 'page' : undefined}
                    >
                        {page}
                    </Link>
                );
            })}

            {!isLastPageActive ? (
                <Link href={getRecipePageLink(CcurrentPage + 1)} title="Gå till nästa sida" className={`${commonLinkClasses} ${defaultLinkClasses} rounded-r-md`}>
                    {nextText}
                </Link>
            ) : (
                <span className={`${commonLinkClasses} ${disabledLinkClasses} rounded-r-md`}>
                    {nextText}
                </span>
            )}
        </nav>
    );
};

export default CustomPagination;