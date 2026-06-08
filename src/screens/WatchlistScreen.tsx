import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WatchlistItem } from '../types';
import { loadWatchlist, saveWatchlist } from '../utils/watchlist';
import { POPULAR_STOCKS, StockInfo } from '../data/stockList';
import DimensionWeightModal from '../components/DimensionWeightModal';
import { Colors, Spacing, Radius, CardShadow } from '../theme';
import { t } from '../i18n';
import { useLanguage } from '../hooks/useLanguage';

// ── Sub-components ────────────────────────────────────────────────────────────

function SectorBadge({ sector }: { sector: string }) {
  return (
    <View style={styles.sectorBadge}>
      <Text style={styles.sectorText}>{sector}</Text>
    </View>
  );
}

interface StockChipProps {
  stock: StockInfo;
  added: boolean;
  onToggle: () => void;
}

function StockChip({ stock, added, onToggle }: StockChipProps) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.7}
      style={[styles.popularChip, added && styles.popularChipAdded]}
    >
      <Text style={[styles.popularChipTicker, added && styles.popularChipTickerAdded]}>
        {stock.ticker}
      </Text>
      {added && <Text style={styles.checkMark}>✓</Text>}
    </TouchableOpacity>
  );
}

interface WatchlistCardProps {
  item: WatchlistItem;
  onConfigure: () => void;
  onRemove: () => void;
  lang: string;
}

function WatchlistCard({ item, onConfigure, lang }: WatchlistCardProps) {
  return (
    <View style={[styles.card, CardShadow]}>
      <View style={styles.cardMain}>
        <View style={styles.cardLeft}>
          <Text style={styles.cardTicker}>{item.ticker}</Text>
          <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
          <SectorBadge sector={item.sector} />
        </View>
        <TouchableOpacity
          onPress={onConfigure}
          style={styles.configBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.configBtnText}>{t('watchlist_weights', lang)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

interface SearchRowProps {
  stock: StockInfo;
  added: boolean;
  onToggle: () => void;
}

function SearchRow({ stock, added, onToggle }: SearchRowProps) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.7}
      style={styles.searchRow}
    >
      <View style={styles.searchRowLeft}>
        <Text style={styles.searchTicker}>{stock.ticker}</Text>
        <Text style={styles.searchName}>{stock.name}</Text>
      </View>
      <View style={styles.searchRowRight}>
        <SectorBadge sector={stock.sector} />
        <View style={[styles.addBtn, added && styles.addBtnAdded]}>
          <Text style={[styles.addBtnText, added && styles.addBtnTextAdded]}>
            {added ? '✓' : '+'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function WatchlistScreen() {
  const lang = useLanguage();
  const [watchlist, setWatchlist]       = useState<WatchlistItem[]>([]);
  const [query, setQuery]               = useState('');
  const [selectedItem, setSelectedItem] = useState<WatchlistItem | null>(null);

  useEffect(() => { loadWatchlist().then(setWatchlist); }, []);

  const watchlistTickers = useMemo(
    () => new Set(watchlist.map(i => i.ticker)),
    [watchlist],
  );

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return POPULAR_STOCKS.filter(
      s => s.ticker.toLowerCase().includes(q) || s.name.toLowerCase().includes(q),
    );
  }, [query]);

  const toggleStock = useCallback(async (stock: StockInfo) => {
    let updated: WatchlistItem[];
    if (watchlistTickers.has(stock.ticker)) {
      updated = watchlist.filter(i => i.ticker !== stock.ticker);
    } else {
      const item: WatchlistItem = {
        ticker:  stock.ticker,
        name:    stock.name,
        sector:  stock.sector,
        addedAt: new Date().toISOString(),
      };
      updated = [...watchlist, item];
    }
    setWatchlist(updated);
    await saveWatchlist(updated);
  }, [watchlist, watchlistTickers]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('watchlist_title', lang)}</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder={t('watchlist_search', lang)}
          placeholderTextColor={Colors.textSecondary}
          autoCapitalize="characters"
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      {query.trim() ? (
        /* ── Search results ──────────────────────────────── */
        <FlatList
          data={searchResults}
          keyExtractor={s => s.ticker}
          renderItem={({ item }) => (
            <SearchRow
              stock={item}
              added={watchlistTickers.has(item.ticker)}
              onToggle={() => toggleStock(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        /* ── Browse mode ─────────────────────────────────── */
        <ScrollView
          contentContainerStyle={styles.browseContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Popular chips */}
          <Text style={styles.sectionLabel}>{t('watchlist_popular', lang)}</Text>
          <View style={styles.chipsGrid}>
            {POPULAR_STOCKS.slice(0, 20).map(stock => (
              <StockChip
                key={stock.ticker}
                stock={stock}
                added={watchlistTickers.has(stock.ticker)}
                onToggle={() => toggleStock(stock)}
              />
            ))}
          </View>

          {/* My watchlist */}
          {watchlist.length > 0 ? (
            <>
              <Text style={styles.sectionLabel}>{t('watchlist_mine', lang)}</Text>
              {watchlist.map(item => (
                <WatchlistCard
                  key={item.ticker}
                  item={item}
                  onConfigure={() => setSelectedItem(item)}
                  onRemove={() => toggleStock(item)}
                  lang={lang}
                />
              ))}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStar}>☆</Text>
              <Text style={styles.emptyTitle}>{t('watchlist_empty', lang)}</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Dimension weight modal */}
      {selectedItem && (
        <DimensionWeightModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          lang={lang}
        />
      )}
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 40,
    gap: Spacing.sm,
  },
  searchIcon: { fontSize: 14 },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    height: 40,
  },

  listContent: { padding: Spacing.md },
  browseContent: { padding: Spacing.lg, paddingTop: Spacing.md, gap: Spacing.sm },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },

  // Popular chips
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  popularChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  popularChipAdded: {
    borderColor: Colors.accentGold,
    backgroundColor: Colors.accentGold + '18',
  },
  popularChipTicker: { fontSize: 13, fontWeight: '500', color: Colors.textPrimary },
  popularChipTickerAdded: { color: Colors.accentGold },
  checkMark: { fontSize: 11, color: Colors.accentGold },

  // Sector badge
  sectorBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    alignSelf: 'flex-start',
  },
  sectorText: { fontSize: 11, color: Colors.textSecondary },

  // Watchlist card
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  cardMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeft: { flex: 1, gap: 4 },
  cardTicker: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  cardName: { fontSize: 13, color: Colors.textSecondary },
  configBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.button,
    borderWidth: 1,
    borderColor: Colors.accentBlue,
  },
  configBtnText: { fontSize: 12, color: Colors.accentBlue, fontWeight: '500' },

  // Search results
  searchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  searchRowLeft: { flex: 1, gap: 2 },
  searchTicker: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  searchName: { fontSize: 13, color: Colors.textSecondary },
  searchRowRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.accentBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnAdded: { backgroundColor: Colors.accentBlue, borderColor: Colors.accentBlue },
  addBtnText: { fontSize: 16, color: Colors.accentBlue, lineHeight: 20 },
  addBtnTextAdded: { color: Colors.white, fontWeight: '700' },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    gap: Spacing.sm,
  },
  emptyStar: { fontSize: 40, color: Colors.border },
  emptyTitle: { fontSize: 15, color: Colors.textSecondary },
});
